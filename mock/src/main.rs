// Crates.io mock server

use axum::{Router, http::StatusCode, response::Json, routing::put};
use serde::Serialize;
use tokio;

#[derive(Serialize)]
struct TokenResponse {
    token: String,
}

async fn get_token() -> Result<Json<TokenResponse>, StatusCode> {
    let response = TokenResponse {
        token: "mock-token".to_string(),
    };
    Ok(Json(response))
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/api/v1/trusted_publishing/tokens", put(get_token));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    println!("Server running on http://0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();
}
