"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckIcon, CircleXIcon } from "lucide-react";

export function Todo() {
  const tasks = useQuery(api.tasks.get);
  const [newTaskText, setNewTaskText] = useState("");

  // Mutations to add and update tasks will be implemented later
  // const addTask = useMutation(api.tasks.add);
  // const toggleTask = useMutation(api.tasks.toggle);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    // When the add mutation is implemented:
    // await addTask({ text: newTaskText.trim() });
    setNewTaskText("");
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    // When the toggle mutation is implemented: 
    // await toggleTask({ id: taskId, isCompleted: !isCompleted });
  };

  if (tasks === undefined) {
    return <div className="animate-pulse">Loading tasks...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>My Tasks</CardTitle>
        <CardDescription>Manage your personal tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={!newTaskText.trim()}>
            Add
          </Button>
        </form>

        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No tasks yet. Add one to get started!
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task._id} 
                className="flex items-center p-3 border rounded-md group hover:bg-muted/50"
              >
                <div className="mr-2">
                  <input
                    type="checkbox"
                    id={task._id}
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task._id, task.isCompleted)}
                  />
                </div>
                <span className={task.isCompleted ? "line-through text-muted-foreground" : ""}>
                  {task.text}
                </span>
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {task.isCompleted ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <CircleXIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 