"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const rows = [
  { id: "A-1001", patient: "John Smith", doctor: "Dr. Jane Doe", datetime: "2025-09-22 10:00", status: "Upcoming" },
  {
    id: "A-1002",
    patient: "Emily Johnson",
    doctor: "Dr. Mark Cole",
    datetime: "2025-09-20 11:15",
    status: "Completed",
  },
  { id: "A-1003", patient: "Michael Green", doctor: "Dr. Jane Doe", datetime: "2025-09-19 09:30", status: "Cancelled" },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Upcoming: "bg-primary/10 text-primary",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  }
  return <Badge className={map[status] || ""}>{status}</Badge>
}

export function AppointmentsTable() {
  const [status, setStatus] = useState<string | undefined>()
  const [doctor, setDoctor] = useState<string | undefined>()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchStatus = !status || r.status === status
      const matchDoctor = !doctor || r.doctor.includes(doctor)
      const t = new Date(r.datetime.replace(" ", "T"))
      const fromOk = !from || t >= new Date(from)
      const toOk = !to || t <= new Date(to)
      return matchStatus && matchDoctor && fromOk && toOk
    })
  }, [status, doctor, from, to])

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Appointments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Date from</div>
            <Input type="date" value={from} onChange={(e) => setFrom(e.currentTarget.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Date to</div>
            <Input type="date" value={to} onChange={(e) => setTo(e.currentTarget.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={doctor} onValueChange={setDoctor}>
            <SelectTrigger>
              <SelectValue placeholder="Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dr. Jane Doe">Dr. Jane Doe</SelectItem>
              <SelectItem value="Dr. Mark Cole">Dr. Mark Cole</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Appointment ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.patient}</TableCell>
                  <TableCell>{r.doctor}</TableCell>
                  <TableCell>{r.datetime}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
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
