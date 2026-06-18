import sqlite3

conn = sqlite3.connect('ingres.db')
cur = conn.cursor()

# Step 1: Promote admin@ingres.ai to admin
cur.execute("UPDATE users SET role = 'admin' WHERE email = 'admin@ingres.ai'")
print("✓ Promoted admin@ingres.ai to admin")

# Step 2: Promote jerittajancy@gmail.com to user (already user, just confirm)
cur.execute("UPDATE users SET role = 'user' WHERE email = 'jerittajancy@gmail.com'")
print("✓ Confirmed jerittajancy@gmail.com as user")

# Step 3: Delete test accounts
test_emails = ['admin@test.com', 'viewer@test.com', 'other@test.com']
for email in test_emails:
    cur.execute("DELETE FROM users WHERE email = ?", (email,))
    print(f"✓ Deleted {email}")

conn.commit()

# Show final state
cur.execute("SELECT email, role FROM users ORDER BY email")
rows = cur.fetchall()
print("\n=== FINAL USER STATE ===")
print(f"{'EMAIL':<30} | {'ROLE'}")
print("-" * 45)
for r in rows:
    print(f"{r[0]:<30} | {r[1]}")

conn.close()
