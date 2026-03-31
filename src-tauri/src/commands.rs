use crate::db::{Agent, Company, Database, TableRecord};
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::Arc;
use tauri::State;

fn ts() -> i64 {
    std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis() as i64
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCompanyInput {
    pub id: String, pub name: String, pub table_id: String,
    pub ceo_id: String, pub ceo_name: String, pub ceo_avatar: String,
    pub ceo_bio: Option<String>, pub ceo_skills: Option<String>,
    pub agent_workspace: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCompanyResult { pub company: Company, pub ceo: Agent }

#[derive(Debug, Serialize, Deserialize)]
pub struct RecruitAgentInput {
    pub id: String, pub name: String, pub role: String,
    pub avatar: String, pub bio: Option<String>, pub skills: Option<String>,
    pub openclaw_workspace: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListAllAgentsResult { pub agents: Vec<AgentWithCompany> }

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentWithCompany {
    pub agent: Agent,
    pub company_name: Option<String>,
}

fn spawn_openclaw_agent(workspace: &str, name: &str) -> Result<(), String> {
    let out = Command::new("openclaw")
        .args(["agents", "add", "--workspace", workspace, "--non-interactive", "--json", name])
        .output().map_err(|e| format!("openclaw spawn failed: {}", e))?;
    if !out.status.success() {
        return Err(format!("openclaw failed: {}", String::from_utf8_lossy(&out.stderr)));
    }
    println!("[ClawInc] spawned agent workspace: {}", workspace);
    Ok(())
}

#[tauri::command]
pub fn init_tables(db: State<'_, Arc<Database>>, tables: Vec<TableRecord>) -> Result<(), String> {
    let existing = db.list_tables().map_err(|e| e.to_string())?;
    if existing.is_empty() {
        db.upsert_tables_batch(&tables).map_err(|e| e.to_string())?;
        println!("[ClawInc] initialized {} tables", tables.len());
    }
    Ok(())
}

#[tauri::command]
pub fn list_tables(db: State<'_, Arc<Database>>) -> Result<Vec<TableRecord>, String> {
    db.list_tables().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_company(db: State<'_, Arc<Database>>, input: CreateCompanyInput) -> Result<CreateCompanyResult, String> {
    let now = ts();
    let company = Company { id: input.id.clone(), name: input.name.clone(), table_id: input.table_id.clone(), ceo_id: input.ceo_id.clone(), agent_workspace: input.agent_workspace.clone(), created_at: now };
    let ceo = Agent {
        id: input.ceo_id.clone(), company_id: Some(input.id.clone()), name: input.ceo_name.clone(),
        role: "CEO".to_string(), avatar: input.ceo_avatar.clone(), status: "idle".to_string(),
        session_key: None, bio: input.ceo_bio, skills: input.ceo_skills,
        openclaw_workspace: Some(input.agent_workspace.clone()), is_ceo: true, created_at: now,
    };
    let _ = spawn_openclaw_agent(&input.agent_workspace, &input.name);
    db.create_company(&company).map_err(|e| e.to_string())?;
    db.create_agent(&ceo).map_err(|e| e.to_string())?;
    Ok(CreateCompanyResult { company, ceo })
}

#[tauri::command]
pub fn delete_company(db: State<'_, Arc<Database>>, company_id: String) -> Result<(), String> {
    db.delete_company(&company_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_companies(db: State<'_, Arc<Database>>) -> Result<Vec<Company>, String> {
    db.list_companies().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_all_agents(db: State<'_, Arc<Database>>) -> Result<ListAllAgentsResult, String> {
    let agents = db.list_all_agents().map_err(|e| e.to_string())?;
    let companies = db.list_companies().map_err(|e| e.to_string())?;
    let result: Vec<AgentWithCompany> = agents.into_iter().map(|a| {
        let company_name = a.company_id.as_ref().and_then(|cid| {
            companies.iter().find(|c| &c.id == cid).map(|c| c.name.clone())
        });
        AgentWithCompany { agent: a, company_name }
    }).collect();
    Ok(ListAllAgentsResult { agents: result })
}

#[tauri::command]
pub fn list_agents_by_company(db: State<'_, Arc<Database>>, company_id: String) -> Result<Vec<Agent>, String> {
    db.list_agents_by_company(&company_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_agent(db: State<'_, Arc<Database>>, input: RecruitAgentInput) -> Result<Agent, String> {
    let now = ts();
    if let Some(ref ws) = input.openclaw_workspace {
        let _ = spawn_openclaw_agent(ws, &input.name);
    }
    let agent = Agent {
        id: input.id.clone(), company_id: None, name: input.name.clone(),
        role: input.role.clone(), avatar: input.avatar.clone(), status: "idle".to_string(),
        session_key: None, bio: input.bio.clone(), skills: input.skills.clone(),
        openclaw_workspace: input.openclaw_workspace.clone(), is_ceo: false, created_at: now,
    };
    db.recruit_agent(&agent).map_err(|e| e.to_string())?;
    Ok(agent)
}

#[tauri::command]
pub fn hire_agent(db: State<'_, Arc<Database>>, agent_id: String, company_id: String) -> Result<Agent, String> {
    db.hire_agent(&agent_id, &company_id).map_err(|e| e.to_string())?
        .ok_or_else(|| "Agent not found or already hired".to_string())
}

#[tauri::command]
pub fn delete_agent(db: State<'_, Arc<Database>>, agent_id: String) -> Result<(), String> {
    db.delete_agent(&agent_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_agent_status(db: State<'_, Arc<Database>>, agent_id: String, status: String) -> Result<(), String> {
    db.update_agent_status(&agent_id, &status).map_err(|e| e.to_string())
}
