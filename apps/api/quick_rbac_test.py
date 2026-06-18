#!/usr/bin/env python3
"""Quick RBAC verification test."""

import requests
import json
from datetime import datetime, timedelta, timezone
from jose import jwt

print("=" * 70)
print("RBAC SECURITY FIX VERIFICATION")
print("=" * 70)
print()

# Configuration
API_BASE = "http://127.0.0.1:8000/api/v1"
SECRET_KEY = "your-secret-key-here"
JWT_ALGORITHM = "HS256"

# Test 1: Anonymous access to /conversations
print("Test 1: Anonymous access to /conversations")
print("-" * 70)
response = requests.get(f"{API_BASE}/conversations")
print(f"  Status: {response.status_code}")
if response.status_code == 401:
    print(f"  [PASS] Returns 401 Unauthorized")
    try:
        detail = response.json().get("detail", "N/A")
        print(f"  Detail: {detail}")
    except:
        pass
else:
    print(f"  [FAIL] Expected 401, got {response.status_code}")
    print(f"  Response preview: {response.text[:100]}")
print()

# Test 2: Anonymous access to conversation detail
print("Test 2: Anonymous access to /conversations/{{id}}")
print("-" * 70)
response = requests.get(f"{API_BASE}/conversations/test-conv-id")
print(f"  Status: {response.status_code}")
if response.status_code == 401:
    print(f"  [PASS] Returns 401 Unauthorized")
elif response.status_code == 404:
    print(f"  [PARTIAL] Returns 404 (conversation doesn't exist)")
else:
    print(f"  [FAIL] Expected 401 or 404, got {response.status_code}")
print()

# Test 3: Invalid token
print("Test 3: Invalid token in Authorization header")
print("-" * 70)
headers = {"Authorization": "Bearer invalid-token-123"}
response = requests.get(f"{API_BASE}/conversations", headers=headers)
print(f"  Status: {response.status_code}")
if response.status_code == 401:
    print(f"  [PASS] Invalid token rejected")
    try:
        detail = response.json().get("detail", "N/A")
        print(f"  Detail: {detail}")
    except:
        pass
else:
    print(f"  [FAIL] Expected 401, got {response.status_code}")
print()

# Test 4: Login and get valid token
print("Test 4: Login and test with valid token")
print("-" * 70)
login_response = requests.post(
    f"{API_BASE}/auth/login",
    json={
        "email": "admin@ingres.ai",
        "password": "AdminPassword123!"
    }
)

if login_response.status_code == 200:
    token = login_response.json().get("access_token")
    print(f"  [PASS] Login successful")
    print(f"  Token (first 50 chars): {token[:50]}...")
    
    # Now test with valid token
    print()
    print("Test 4b: Authenticated access to /conversations")
    print("-" * 70)
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/conversations", headers=headers)
    print(f"  Status: {response.status_code}")
    if response.status_code == 200:
        print(f"  [PASS] Authenticated access succeeds")
        data = response.json()
        if isinstance(data, list):
            print(f"  Conversations: {len(data)} items")
        else:
            print(f"  Response: {str(data)[:100]}")
    else:
        print(f"  [FAIL] Expected 200, got {response.status_code}")
else:
    print(f"  [FAIL] Login failed: {login_response.status_code}")
    print(f"  Response: {login_response.text[:100]}")

print()
print("=" * 70)
print("END OF VERIFICATION")
print("=" * 70)
