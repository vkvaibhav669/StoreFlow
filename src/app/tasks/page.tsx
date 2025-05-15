import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import  AppLayout  from "@/components/layout/AppLayout";
import { tasks } from "@/lib/data";
import { Task } from "@/types";

const TasksPage = () => {
  const itTasks: Task[] = tasks.filter((task) => task.department === "IT");

  return (
    <AppLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Tasks - IT Department</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.department}</TableCell>
                <TableCell>{task.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
};

export default TasksPage;