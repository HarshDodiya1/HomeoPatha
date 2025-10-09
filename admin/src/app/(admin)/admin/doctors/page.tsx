import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const doctors = [
  { id: "d1", name: "Dr. Jane Doe", specialization: "Cardiology", fees: "$150" },
  { id: "d2", name: "Dr. Mark Cole", specialization: "Dermatology", fees: "$120" },
]

export default function DoctorsPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Doctors</CardTitle>
        <Link href="/admin/doctors/new">
          <Button>Add Doctor</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.specialization}</TableCell>
                  <TableCell>{d.fees}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/doctors/${d.id}/edit`}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
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
