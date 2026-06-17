"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import type { User, UserRole } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const roles: UserRole[] = ["viewer", "analyst", "editor", "admin", "super_admin"];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [error, setError] = useState<string>();

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setUsers(await api.users());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not load users.");
    }
  }

  async function createUser() {
    setError(undefined);
    try {
      const created = await api.createUser(email, password, role);
      setUsers((current) => [created, ...current]);
      setEmail("");
      setPassword("");
      setRole("viewer");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not create user.");
    }
  }

  async function changeRole(user: User, nextRole: UserRole) {
    setError(undefined);
    try {
      const updated = await api.changeUserRole(user.id, nextRole);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not update role.");
    }
  }

  return (
    <section className="space-y-4 p-4 md:p-6">
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold">User Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Create users and manage role assignments.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
          <select className="rounded-md border bg-card px-3 text-sm" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            {roles.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <Button onClick={() => void createUser()}>Create</Button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </Card>
      <div className="space-y-2">
        {users.map((user) => (
          <Card key={user.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground">{user.id}</p>
            </div>
            <select className="rounded-md border bg-card px-3 py-2 text-sm" value={user.role} onChange={(event) => void changeRole(user, event.target.value as UserRole)}>
              {roles.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Card>
        ))}
      </div>
    </section>
  );
}
