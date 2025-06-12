#!/bin/bash

set -euo pipefail

# Check if permissions are set correctly
if [ -z "$ACTIONS_ID_TOKEN_REQUEST_URL" ]; then
  echo "Error. Please ensure the 'id-token' permission is set to 'write' in your workflow."
  echo "For more information, see: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect#adding-permissions-settings"
  exit 1
fi

audience=$(echo "$REGISTRY_ENDPOINT" | sed 's|^https\?://||')

# Get the GitHub Actions JWT token
echo "Retrieving GitHub Actions JWT token from $ACTIONS_ID_TOKEN_REQUEST_URL"
jwt_response=$(curl -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=$audience")
echo "sent request to $ACTIONS_ID_TOKEN_REQUEST_URL with audience $audience"

# Extract the JWT token from the response
jwt_token=$(echo "$jwt_response" | jq -r '.value')
echo "retrieved jwt"

# Send the request to the endpoint with JWT in payload
token_response=$(curl -X PUT $REGISTRY_ENDPOINT/api/v1/trusted_publishing/tokens \
  -H "Content-Type: application/json" \
  -d "{\"jwt\": \"$jwt_token\"}")
echo "sent request to $REGISTRY_ENDPOINT/api/v1/trusted_publishing/tokens"

# Extract the token from the JSON response `{ "token": "string" }`.
token=$(echo "$token_response" | jq -r '.token')
echo "retrieved token"

# Store the token in GitHub Actions output
echo "token=$token" >> $GITHUB_OUTPUT
