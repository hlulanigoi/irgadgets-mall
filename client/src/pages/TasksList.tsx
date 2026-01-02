import { useTasks, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckCircle, 
  CircleDashed,
  Loader2,
  Truck
} from "lucide-react";
import { motion } from "framer-motion";
import { type Task, type Order } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

function TransportDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/pending-transport"],
  });

  const transportMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { 
        status: "picked_up" 
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Delivery Accepted!", 
        description: "You've been assigned as the transporter." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/pending-transport"] });
    },
  });

  if (isLoading) return <Loader2 className="animate-spin mx-auto mt-8" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold font-display">Delivery Requests</h2>
      </div>
      
      {orders?.length === 0 ? (
        <p className="text-muted-foreground bg-white p-8 rounded-xl border border-dashed text-center text-sm">
          No delivery requests at the moment.
        </p>
      ) : (
        <div className="grid gap-4">
          {orders?.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex justify-between">
                  <span>Order #{order.id}</span>
                  <span className="text-primary">Transport Needed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center gap-4">
                <p className="text-xs text-muted-foreground leading-relaxed">Local pickup and drop-off request from a neighbor.</p>
                <Button 
                  size="sm" 
                  onClick={() => transportMutation.mutate(order.id)}
                  disabled={transportMutation.isPending}
                >
                  Accept
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const { user } = useAuth();
  const { mutate: updateStatus, isPending } = useUpdateTaskStatus();

  const isAssigned = !!task.assigneeId;
  const isCompleted = task.status === "completed";
  const isCreator = user?.id === task.creatorId;

  const handleTakeTask = () => {
    if (!confirm("Are you sure you want to take this task?")) return;
    updateStatus({ id: task.id, status: "in_progress" });
  };

  const handleComplete = () => {
    if (!confirm("Mark this task as complete?")) return;
    updateStatus({ id: task.id, status: "completed" });
  };

  return (
    <div className={`
      bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg
      ${isCompleted ? 'border-green-100 bg-green-50/30 opacity-75' : 'border-gray-100'}
    `}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-lg font-bold font-display text-gray-900 mb-1 ${isCompleted && 'line-through text-gray-500'}`}>
            {task.title}
          </h3>
          <div className="flex items-center text-xs text-muted-foreground gap-3">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {task.createdAt ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : 'Just now'}
            </span>
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {task.location}
            </span>
          </div>
        </div>
        <div className="bg-secondary/10 text-secondary font-mono font-bold px-3 py-1 rounded-lg text-sm whitespace-nowrap">
          R {task.budget}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-6 line-clamp-3">
        {task.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-100">
        <div className="flex items-center gap-2">
          {task.status === "completed" ? (
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">
              <CheckCircle className="w-3 h-3 mr-1" /> Completed
            </span>
          ) : task.status === "in_progress" ? (
             <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
              <CircleDashed className="w-3 h-3 mr-1" /> In Progress
            </span>
          ) : (
            <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
              Open
            </span>
          )}
        </div>

        {user && !isCompleted && !isCreator && task.status === "open" && (
          <Button 
            size="sm" 
            onClick={handleTakeTask} 
            disabled={isPending}
            className="bg-gray-900 hover:bg-black text-white"
          >
            Take Task
          </Button>
        )}

        {isCreator && !isCompleted && task.status !== "completed" && (
           <Button 
            size="sm" 
            variant="outline"
            onClick={handleComplete}
            disabled={isPending}
            className="text-green-600 hover:bg-green-50 border-green-200"
          >
            Mark Complete
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TasksList() {
  const { data: tasks, isLoading, error } = useTasks();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">Community Tasks</h1>
                <p className="text-muted-foreground text-lg text-balance">
                  Earn extra money by helping your neighbors, or post a task to get things done.
                </p>
              </div>
              
              <CreateTaskModal />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-secondary" />
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-medium">Failed to load tasks.</p>
              </div>
            ) : tasks?.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks available</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  The task board is empty. Why not post the first one?
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks?.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <TaskCard task={task} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-2xl font-display font-bold mb-4 text-balance">Become a Community Hero</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Earn money by helping your neighbors with grocery deliveries, laundry pickups, or small errands. 
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Flexible hours
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Help your local community
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Fast payments
                  </div>
                </div>
              </div>
            </div>

            <TransportDashboard />
          </aside>
        </div>
      </main>
    </div>
  );
}
