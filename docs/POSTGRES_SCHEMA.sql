CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  title VARCHAR NOT NULL DEFAULT 'Groundwater conversation',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id VARCHAR PRIMARY KEY,
  conversation_id VARCHAR NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL,
  content TEXT NOT NULL,
  language VARCHAR NOT NULL DEFAULT 'en',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  source VARCHAR NOT NULL UNIQUE,
  content_type VARCHAR NOT NULL DEFAULT 'text/plain',
  chunk_count INTEGER NOT NULL DEFAULT 0,
  uploaded_by_id VARCHAR REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_users_email ON users(email);
CREATE INDEX ix_documents_source ON documents(source);
CREATE INDEX ix_conversations_user_id ON conversations(user_id);
CREATE INDEX ix_messages_conversation_id ON messages(conversation_id);
