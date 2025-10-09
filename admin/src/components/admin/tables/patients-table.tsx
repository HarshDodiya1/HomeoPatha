"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const rows = [
  {
    id: "p1",
    name: "John Smith",
    email: "john@example.com",
    contact: "+1 555 120 2222",
    lastAppt: "2025-09-18",
    orders: 3,
  },
  {
    id: "p2",
    name: "Emily Johnson",
    email: "emily@example.com",
    contact: "+1 555 444 7777",
    lastAppt: "2025-09-22",
    orders: 1,
  },
  {
    id: "p3",
    name: "Michael Green",
    email: "michael@example.com",
    contact: "+1 555 777 8888",
    lastAppt: "2025-10-01",
    orders: 5,
  },
]

export function PatientsTable() {
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState<string | undefined>()

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchQ = [r.name, r.email, r.contact].join(" ").toLowerCase().includes(q.toLowerCase())
      const matchF = !filter ? true : filter === "high" ? r.orders >= 3 : r.orders < 3
      return matchQ && matchF
    })
  }, [q, filter])

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Patients</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Input
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            placeholder="Search patients..."
            className="max-w-sm"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High orders (&gt;=3)</SelectItem>
              <SelectItem value="low">Low orders (&lt;3)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Last Appointment</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.contact}</TableCell>
                  <TableCell>{r.lastAppt}</TableCell>
                  <TableCell>{r.orders}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/patients/${r.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
