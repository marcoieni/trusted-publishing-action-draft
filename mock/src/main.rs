// Crates.io mock server

use axum::{
    Router,
    http::StatusCode,
    response::Json,
    routing::{delete, get, put},
};
use serde::{Deserialize, Serialize};
use tokio;

#[derive(Deserialize)]
struct TokenRequest {
    #[serde(rename = "jwt")]
    _jwt: String,
}

#[derive(Serialize)]
struct TokenResponse {
    token: String,
}

async fn get_token(Json(_payload): Json<TokenRequest>) -> Result<Json<TokenResponse>, StatusCode> {
    let response = TokenResponse {
        token: "mock-token".to_string(),
    };
    Ok(Json(response))
}

async fn revoke_token() -> Result<StatusCode, ()> {
    Ok(StatusCode::NO_CONTENT)
}

async fn health() -> Result<(), StatusCode> {
    Ok(())
}

#[tokio::main]
async fn main() {
    let tokens_endpoint ="/api/v1/trusted_publishing/tokens";
    let app = Router::new()
        .route(tokens_endpoint, put(get_token))
        .route(tokens_endpoint, delete(revoke_token))
        .route("/health", get(health));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    println!("Server running on http://0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();
}
