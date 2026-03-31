use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Company {
    pub id: String,
    pub name: String,
    pub table_id: String,
    pub ceo_id: String,
    pub agent_workspace: String,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Agent {
    pub id: String,
    pub company_id: Option<String>,
    pub name: String,
    pub role: String,
    pub avatar: String,
    pub status: String,
    pub session_key: Option<String>,
    pub bio: Option<String>,
    pub skills: Option<String>,
    pub openclaw_workspace: Option<String>,
    pub is_ceo: bool,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TableRecord {
    pub id: String,
    pub x: i64,
    pub y: i64,
}

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(&db_path)?;
        let db = Database { conn: Mutex::new(conn) };
        db.init()?;
        Ok(db)
    }

    fn init(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, table_id TEXT NOT NULL, ceo_id TEXT NOT NULL, agent_workspace TEXT NOT NULL, created_at INTEGER NOT NULL)", [])?;
        conn.execute("CREATE TABLE IF NOT EXISTS agents (id TEXT PRIMARY KEY, company_id TEXT, name TEXT NOT NULL, role TEXT NOT NULL, avatar TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'idle', session_key TEXT, bio TEXT, skills TEXT, openclaw_workspace TEXT, is_ceo INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, FOREIGN KEY (company_id) REFERENCES companies(id))", [])?;
        conn.execute("CREATE TABLE IF NOT EXISTS tables (id TEXT PRIMARY KEY, x INTEGER NOT NULL, y INTEGER NOT NULL)", [])?;
        let _ = conn.execute("ALTER TABLE agents ADD COLUMN bio TEXT", []);
        let _ = conn.execute("ALTER TABLE agents ADD COLUMN skills TEXT", []);
        let _ = conn.execute("ALTER TABLE agents ADD COLUMN openclaw_workspace TEXT", []);
        let _ = conn.execute("ALTER TABLE agents ADD COLUMN is_ceo INTEGER NOT NULL DEFAULT 0", []);
        Ok(())
    }

    pub fn list_tables(&self) -> Result<Vec<TableRecord>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, x, y FROM tables")?;
        let rows = stmt.query_map([], |row| Ok(TableRecord { id: row.get(0)?, x: row.get(1)?, y: row.get(2)? }))?;
        let mut v = Vec::new();
        for r in rows { v.push(r?); }
        Ok(v)
    }

    pub fn upsert_tables_batch(&self, tables: &[TableRecord]) -> Result<()> {
        let mut conn = self.conn.lock().unwrap();
        let tx = conn.transaction()?;
        for t in tables {
            tx.execute("INSERT INTO tables (id, x, y) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET x=excluded.x, y=excluded.y", params![t.id, t.x, t.y])?;
        }
        tx.commit()?;
        Ok(())
    }

    pub fn create_company(&self, c: &Company) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("INSERT INTO companies (id, name, table_id, ceo_id, agent_workspace, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)", params![c.id, c.name, c.table_id, c.ceo_id, c.agent_workspace, c.created_at])?;
        Ok(())
    }

    pub fn delete_company(&self, company_id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("UPDATE agents SET company_id = NULL WHERE company_id = ?1", params![company_id])?;
        conn.execute("DELETE FROM companies WHERE id = ?1", params![company_id])?;
        Ok(())
    }

    pub fn list_companies(&self) -> Result<Vec<Company>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, name, table_id, ceo_id, agent_workspace, created_at FROM companies")?;
        let rows = stmt.query_map([], |row| Ok(Company { id: row.get(0)?, name: row.get(1)?, table_id: row.get(2)?, ceo_id: row.get(3)?, agent_workspace: row.get(4)?, created_at: row.get(5)? }))?;
        let mut v = Vec::new();
        for r in rows { v.push(r?); }
        Ok(v)
    }

    pub fn create_agent(&self, a: &Agent) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("INSERT INTO agents (id, company_id, name, role, avatar, status, session_key, bio, skills, openclaw_workspace, is_ceo, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)", params![a.id, a.company_id, a.name, a.role, a.avatar, a.status, a.session_key, a.bio, a.skills, a.openclaw_workspace, a.is_ceo as i32, a.created_at])?;
        Ok(())
    }

    fn agent_row(row: &rusqlite::Row) -> rusqlite::Result<Agent> {
        Ok(Agent {
            id: row.get(0)?, company_id: row.get(1)?, name: row.get(2)?, role: row.get(3)?,
            avatar: row.get(4)?, status: row.get(5)?, session_key: row.get(6)?,
            bio: row.get(7)?, skills: row.get(8)?, openclaw_workspace: row.get(9)?,
            is_ceo: row.get::<_, i32>(10)? != 0, created_at: row.get(11)?,
        })
    }

    pub fn list_all_agents(&self) -> Result<Vec<Agent>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, company_id, name, role, avatar, status, session_key, bio, skills, openclaw_workspace, is_ceo, created_at FROM agents ORDER BY created_at DESC")?;
        let rows = stmt.query_map([], Self::agent_row)?;
        let mut v = Vec::new();
        for r in rows { v.push(r?); }
        Ok(v)
    }

    pub fn list_agents_by_company(&self, company_id: &str) -> Result<Vec<Agent>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, company_id, name, role, avatar, status, session_key, bio, skills, openclaw_workspace, is_ceo, created_at FROM agents WHERE company_id = ?1 ORDER BY is_ceo DESC, created_at ASC")?;
        let rows = stmt.query_map(params![company_id], Self::agent_row)?;
        let mut v = Vec::new();
        for r in rows { v.push(r?); }
        Ok(v)
    }

    pub fn hire_agent(&self, agent_id: &str, company_id: &str) -> Result<Option<Agent>> {
        let conn = self.conn.lock().unwrap();
        conn.execute("UPDATE agents SET company_id = ?1, status = 'idle' WHERE id = ?2 AND company_id IS NULL", params![company_id, agent_id])?;
        drop(conn);
        self.get_agent(agent_id)
    }

    pub fn recruit_agent(&self, a: &Agent) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("INSERT INTO agents (id, company_id, name, role, avatar, status, session_key, bio, skills, openclaw_workspace, is_ceo, created_at) VALUES (?1, NULL, ?2, ?3, ?4, 'idle', NULL, ?5, ?6, ?7, 0, ?8)", params![a.id, a.name, a.role, a.avatar, a.bio, a.skills, a.openclaw_workspace, a.created_at])?;
        Ok(())
    }

    pub fn update_agent_status(&self, agent_id: &str, status: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("UPDATE agents SET status = ?1 WHERE id = ?2", params![status, agent_id])?;
        Ok(())
    }

    pub fn delete_agent(&self, agent_id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM agents WHERE id = ?1", params![agent_id])?;
        Ok(())
    }

    pub fn get_agent(&self, agent_id: &str) -> Result<Option<Agent>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, company_id, name, role, avatar, status, session_key, bio, skills, openclaw_workspace, is_ceo, created_at FROM agents WHERE id = ?1")?;
        let mut rows = stmt.query(params![agent_id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Self::agent_row(row)?))
        } else {
            Ok(None)
        }
    }
}
