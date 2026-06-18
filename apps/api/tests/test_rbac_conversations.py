"""
RBAC Security Tests for Conversation Endpoints

Tests verify:
1. Anonymous access returns 401 Unauthorized
2. Cross-user access returns 403 Forbidden  
3. Admin access succeeds with all conversations
4. User access succeeds for own conversations only
5. Proper error codes and messages
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.db.session import SessionLocal
from app.main import app
from app.models.entities import User, UserRole, Conversation, Message
from app.db.init_db import init_db


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    init_db()
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="function")
def client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def create_test_users(db: Session):
    """Create test users with different roles."""
    # Create viewer user
    viewer = User(
        email="viewer@test.com",
        password_hash="hashed_password",
        role=UserRole.viewer.value
    )
    db.add(viewer)
    db.flush()
    
    # Create admin user
    admin = User(
        email="admin@test.com",
        password_hash="hashed_password",
        role=UserRole.admin.value
    )
    db.add(admin)
    db.flush()
    
    # Create another viewer to test cross-user access
    other_viewer = User(
        email="other@test.com",
        password_hash="hashed_password",
        role=UserRole.viewer.value
    )
    db.add(other_viewer)
    db.commit()
    
    return {
        "viewer": viewer,
        "admin": admin,
        "other_viewer": other_viewer,
    }


@pytest.fixture
def create_test_conversations(db: Session, create_test_users):
    """Create test conversations for different users."""
    users = create_test_users
    
    # Viewer's conversation
    conv1 = Conversation(
        user_id=users["viewer"].id,
        title="Viewer's groundwater question",
        updated_at=None  # Will use default
    )
    db.add(conv1)
    db.flush()
    
    # Add message to conversation
    msg1 = Message(
        conversation_id=conv1.id,
        role="user",
        content="What are groundwater levels?",
        language="en"
    )
    db.add(msg1)
    db.flush()
    
    # Other viewer's conversation
    conv2 = Conversation(
        user_id=users["other_viewer"].id,
        title="Other user's groundwater question",
        updated_at=None
    )
    db.add(conv2)
    db.flush()
    
    msg2 = Message(
        conversation_id=conv2.id,
        role="user",
        content="What about recharge rates?",
        language="en"
    )
    db.add(msg2)
    db.commit()
    
    return {
        "viewer_conv": conv1,
        "other_conv": conv2,
        "users": users,
    }


class TestConversationsListEndpoint:
    """Tests for GET /conversations endpoint."""
    
    def test_anonymous_access_returns_401(self, client: TestClient):
        """Anonymous users should get 401 Unauthorized."""
        response = client.get("/api/v1/conversations")
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]
    
    def test_authenticated_user_sees_only_own_conversations(
        self,
        client: TestClient,
        create_test_conversations
    ):
        """Authenticated viewer should only see their own conversations."""
        data = create_test_conversations
        viewer = data["users"]["viewer"]
        viewer_conv = data["viewer_conv"]
        
        # Create JWT token for viewer
        token = create_access_token(viewer.id, viewer.role)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get("/api/v1/conversations", headers=headers)
        assert response.status_code == 200
        
        conversations = response.json()
        # Should only see their own conversation
        assert len(conversations) == 1
        assert conversations[0]["id"] == viewer_conv.id
        assert conversations[0]["title"] == "Viewer's groundwater question"
    
    def test_admin_sees_all_conversations(
        self,
        client: TestClient,
        create_test_conversations
    ):
        """Admin users should see all conversations from all users."""
        data = create_test_conversations
        admin = data["users"]["admin"]
        viewer_conv = data["viewer_conv"]
        other_conv = data["other_conv"]
        
        # Create JWT token for admin
        token = create_access_token(admin.id, admin.role)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get("/api/v1/conversations", headers=headers)
        assert response.status_code == 200
        
        conversations = response.json()
        # Admin should see all conversations
        assert len(conversations) >= 2
        
        conv_ids = [c["id"] for c in conversations]
        assert viewer_conv.id in conv_ids
        assert other_conv.id in conv_ids


class TestConversationDetailEndpoint:
    """Tests for GET /conversations/{id} endpoint."""
    
    def test_anonymous_access_returns_401(
        self,
        client: TestClient,
        create_test_conversations
    ):
        """Anonymous users should get 401 Unauthorized."""
        conv_id = create_test_conversations["viewer_conv"].id
        response = client.get(f"/api/v1/conversations/{conv_id}")
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]
    
    def test_user_can_access_own_conversation(
        self,
        client: TestClient,
        create_test_conversations
    ):
        """User should be able to access their own conversation."""
        data = create_test_conversations
        viewer = data["users"]["viewer"]
        viewer_conv = data["viewer_conv"]
        
        token = create_access_token(viewer.id, viewer.role)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get(f"/api/v1/conversations/{viewer_conv.id}", headers=headers)
        assert response.status_code == 200
        
        conv_data = response.json()
        assert conv_data["id"] == viewer_conv.id
        assert conv_data["title"] == "Viewer's groundwater question"
        assert len(conv_data["messages"]) == 1
        assert conv_data["messages"][0]["content"] == "What are groundwater levels?"
    
    def test_user_cannot_access_other_user_conversation(
        self,
        client: TestClient,
        create_test_conversations
    ):
        """User should NOT be able to access another user's conversation (403)."""
        data = create_test_conversations
        viewer = data["users"]["viewer"]
        other_conv = data["other_conv"]  # Belongs to other_viewer
        
        token = create_access_token(viewer.id, viewer.role)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get(f"/api/v1/conversations/{other_conv.id}", headers=headers)
        assert response.status_code == 403
        assert "Insufficient permissions" in response.json()["detail"]
    
    def test_admin_can_access_any_conversation(
        self,
        client: TestClient,
        create_test_conversations
    ):
        """Admin should be able to access any conversation."""
        data = create_test_conversations
        admin = data["users"]["admin"]
        viewer_conv = data["viewer_conv"]
        other_conv = data["other_conv"]
        
        token = create_access_token(admin.id, admin.role)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Admin can access viewer's conversation
        response = client.get(f"/api/v1/conversations/{viewer_conv.id}", headers=headers)
        assert response.status_code == 200
        assert response.json()["id"] == viewer_conv.id
        
        # Admin can access other viewer's conversation
        response = client.get(f"/api/v1/conversations/{other_conv.id}", headers=headers)
        assert response.status_code == 200
        assert response.json()["id"] == other_conv.id
    
    def test_invalid_conversation_returns_404(
        self,
        client: TestClient,
        create_test_conversations
    ):
        """Accessing non-existent conversation returns 404."""
        viewer = create_test_conversations["users"]["viewer"]
        
        token = create_access_token(viewer.id, viewer.role)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get(f"/api/v1/conversations/nonexistent-id", headers=headers)
        assert response.status_code == 404
        assert "Conversation not found" in response.json()["detail"]


class TestErrorCodes:
    """Test that proper HTTP status codes are returned."""
    
    def test_401_for_missing_auth_header(self, client: TestClient):
        """Missing auth header returns 401."""
        response = client.get("/api/v1/conversations")
        assert response.status_code == 401
    
    def test_401_for_invalid_token(self, client: TestClient):
        """Invalid token returns 401."""
        headers = {"Authorization": "Bearer invalid-token"}
        response = client.get("/api/v1/conversations", headers=headers)
        assert response.status_code == 401
    
    def test_403_for_insufficient_access(
        self,
        client: TestClient,
        create_test_conversations
    ):
        """Accessing other user's conversation returns 403."""
        data = create_test_conversations
        viewer = data["users"]["viewer"]
        other_conv = data["other_conv"]
        
        token = create_access_token(viewer.id, viewer.role)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get(f"/api/v1/conversations/{other_conv.id}", headers=headers)
        assert response.status_code == 403


class TestAuditLogging:
    """Test that access is properly logged."""
    
    def test_conversation_access_is_logged(
        self,
        client: TestClient,
        create_test_conversations,
        db: Session
    ):
        """Accessing conversation should create audit log."""
        data = create_test_conversations
        viewer = data["users"]["viewer"]
        viewer_conv = data["viewer_conv"]
        
        token = create_access_token(viewer.id, viewer.role)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Clear any existing logs
        from app.models.entities import AuditLog
        db.query(AuditLog).delete()
        db.commit()
        
        # Access conversation
        response = client.get(f"/api/v1/conversations/{viewer_conv.id}", headers=headers)
        assert response.status_code == 200
        
        # Check audit log was created
        from app.models.entities import AuditLog
        logs = db.query(AuditLog).filter(
            AuditLog.action == "VIEW_CONVERSATION"
        ).all()
        
        assert len(logs) > 0
        latest_log = logs[-1]
        assert latest_log.user_id == viewer.id
        assert latest_log.email == viewer.email
        assert latest_log.resource == viewer_conv.id


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
