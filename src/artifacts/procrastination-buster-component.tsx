import React, { useState, useEffect } from 'react';
import { Plus, SmileIcon, FrownIcon, X, Trophy, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const ProcrastinationBuster: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertType, setAlertType] = useState<'success' | 'failure' | 'delete'>('success');

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const storedScore = localStorage.getItem('score');
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    if (storedScore) setScore(parseInt(storedScore));
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('score', score.toString());
  }, [tasks, score]);

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const completeTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: true } : task
    ));
    setScore(score + 10);
    showAlertMessage('success');
  };

  const failTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: true } : task
    ));
    setScore(Math.max(0, score - 5));
    showAlertMessage('failure');
  };

  const removeTask = (id: number) => {
    const taskToRemove = tasks.find(task => task.id === id);
    setTasks(tasks.filter(task => task.id !== id));
    if (taskToRemove && !taskToRemove.completed) {
      setScore(Math.max(0, score - 5));
    }
    showAlertMessage('delete');
  };

  const showAlertMessage = (type: 'success' | 'failure' | 'delete') => {
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const resetAll = () => {
    localStorage.clear();
    setTasks([]);
    setScore(0);
    window.location.reload();
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Procrastination Buster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter a new task"
              className="flex-grow mr-2"
            />
            <Button onClick={addTask}><Plus size={20} /></Button>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                <span className={task.completed ? 'line-through' : ''}>{task.text}</span>
                <div>
                  {!task.completed && (
                    <>
                      <Button onClick={() => completeTask(task.id)} variant="ghost" size="sm">
                        <SmileIcon size={20} className="text-green-500" />
                      </Button>
                      <Button onClick={() => failTask(task.id)} variant="ghost" size="sm">
                        <FrownIcon size={20} className="text-red-500" />
                      </Button>
                    </>
                  )}
                  <Button onClick={() => removeTask(task.id)} variant="ghost" size="sm">
                    <X size={20} className="text-yellow-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Score: {score}</CardTitle>
        </CardHeader>
        <CardContent>
          {score >= 50 ? (
            <p className="text-green-500 flex items-center">
              <Trophy size={20} className="mr-2" /> Great job! Keep it up!
            </p>
          ) : (
            <p className="text-yellow-500 flex items-center">
              <FrownIcon size={20} className="mr-2" /> You can do better! Complete more tasks!
            </p>
          )}
        </CardContent>
      </Card>
      <Button onClick={resetAll} className="w-full">
        <RefreshCw size={20} className="mr-2" /> Reset All
      </Button>
      {showAlert && (
        <Alert className={`mt-4 ${
          alertType === 'success' ? 'bg-green-100' : 
          alertType === 'failure' ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          <AlertTitle>
            {alertType === 'success' ? 'Task Completed!' : 
             alertType === 'failure' ? 'Task Failed' : 'Task Removed'}
          </AlertTitle>
          <AlertDescription>
            {alertType === 'success' ? 'Great job! You earned 10 points.' : 
             alertType === 'failure' ? 'Oh no! You lost 5 points. Stay focused!' :
             'Task removed from the list.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProcrastinationBuster;
