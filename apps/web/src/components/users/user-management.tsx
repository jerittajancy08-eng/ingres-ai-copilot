"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Trash2, Lock, Unlock, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import type { User, UserRole } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const roles: UserRole[] = ["user", "admin"];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setUsers(await api.users());
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }

  async function createUser() {
    setError(undefined);
    setSuccess(undefined);
    try {
      const created = await api.createUser(email, password, role);
      setUsers((current) => [created, ...current]);
      setEmail("");
      setPassword("");
      setRole("user");
      setSuccess("User created successfully");
      setTimeout(() => setSuccess(undefined), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create user.");
    }
  }

  async function changeRole(user: User, nextRole: UserRole) {
    setError(undefined);
    setSuccess(undefined);
    try {
      const updated = await api.changeUserRole(user.id, nextRole);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSuccess(`Updated ${user.email} to ${nextRole}`);
      setTimeout(() => setSuccess(undefined), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role.");
    }
  }

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <section className="space-y-6 p-4 md:p-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="text-3xl font-bold text-blue-600">{adminCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Regular Users</p>
          <p className="text-3xl font-bold text-green-600">{userCount}</p>
        </Card>
      </div>

      {/* Create User Section */}
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">User Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Create users and manage role assignments.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
          <Input 
            value={email} 
            onChange={(event) => setEmail(event.target.value)} 
            placeholder="Email"
            disabled={loading}
          />
          <Input 
            value={password} 
            onChange={(event) => setPassword(event.target.value)} 
            placeholder="Password" 
            type="password"
            disabled={loading}
          />
          <select 
            className="rounded-md border bg-card px-3 text-sm disabled:opacity-50" 
            value={role} 
            onChange={(event) => setRole(event.target.value as UserRole)}
            disabled={loading}
          >
            {roles.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <Button 
            onClick={() => void createUser()}
            disabled={loading}
          >
            Create
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-3 text-sm text-green-600">{success}</p>}
      </Card>

      {/* User Search */}
      <div>
        <Input
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Users List */}
      <div className="space-y-2">
        {loading ? (
          <Card className="p-4 text-center text-muted-foreground">Loading users...</Card>
        ) : filteredUsers.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">No users found</Card>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-5 gap-3 px-4 py-3 bg-card/50 rounded-lg text-sm font-semibold text-muted-foreground border">
              <div>Email</div>
              <div>Role</div>
              <div>Status</div>
              <div>Created</div>
              <div className="text-right">Actions</div>
            </div>

            {/* User Rows */}
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="grid md:grid-cols-5 gap-3 items-center">
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select 
                      className="rounded-md border bg-card px-2 py-1 text-sm" 
                      value={user.role} 
                      onChange={(event) => void changeRole(user, event.target.value as UserRole)}
                    >
                      {roles.map((item) => (
                        <option key={item} value={item}>
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="hidden md:flex">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border border-green-200">
                      Active
                    </span>
                  </div>

                  <div className="hidden md:block text-sm text-muted-foreground">
                    {new Date(user.created_at || Date.now()).toLocaleDateString()}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      title="Disable account"
                      disabled
                      className="text-muted-foreground"
                    >
                      <Lock className="size-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      title="Delete account"
                      disabled
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
