mod commands;
mod db;

use db::Database;
use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())?;
            }
            let app_data_dir = app.handle().path().app_data_dir().expect("failed to get app data dir");
            std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
            let db_path = app_data_dir.join("clawinc.db");
            println!("[ClawInc] DB path: {:?}", db_path);
            let db = Database::new(db_path).expect("failed to init DB");
            app.handle().manage(Arc::new(db));
            println!("[ClawInc] DB ready");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::init_tables,
            commands::list_tables,
            commands::create_company,
            commands::delete_company,
            commands::list_companies,
            commands::list_all_agents,
            commands::list_agents_by_company,
            commands::create_agent,
            commands::hire_agent,
            commands::delete_agent,
            commands::update_agent_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
