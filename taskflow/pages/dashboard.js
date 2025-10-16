import { useState, useEffect, useContext } from 'react'; // import de createContext pour créer un contexte global, useState pour gérer l'état, useEffect pour exécuter du code après le rendu
import axios from 'axios'; // import de Axios pour faire des requêtes HTTP vers l'API backend
import PrivateRoute from '../components/PrivateRoute'; // Protège la page pour certains rôles
import AuthContext from '../context/AuthContext'; // Pour récupérer l'utilisateur connecté et la fonction logout
import Head from 'next/head'; // Composant Next.js pour gérer le <head> de la page (titre, meta, etc.)
import Link from 'next/link'; // Composant Next.js pour créer des liens internes
// Icônes Heroicons utilisées dans le dashboard
import { 
  ListBulletIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  Bars3Icon, 
  XMarkIcon
} from '@heroicons/react/24/solid';


// --- Composant StatCard ---
const StatCard = ({ title, value, icon }) => (
  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center space-x-4">
    <div className="bg-slate-700 p-3 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

// --- Composant pour afficher afficher une tâche individuelle avec "Voir plus" ---
const TaskItem = ({ task, onStatusChange }) => { // onStatusChange est une fonction passée en prop pour mettre à jour le statut de la tâche
    const [isExpanded, setIsExpanded] = useState(false); // État pour gérer l'expansion de la description
    const CHAR_LIMIT = 100; // Limite de caractères avant de tronquer la description
    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'DONE'; // Vérifie si la tâche est en retard
    const needsTruncation = task.description && task.description.length > CHAR_LIMIT; // Vérifie si la description doit être tronquée

    // Gère le changement de statut de la tâche
    const handleCheckboxChange = () => { 
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE'; // Bascule entre 'DONE' et 'TODO'
        onStatusChange(task.id, newStatus); // Appelle la fonction passée en prop pour mettre à jour le statut
    };

    return (
        <div className={`bg-slate-800 p-4 rounded-lg flex items-start justify-between border-l-4 transition-all duration-300 ${isOverdue ? 'border-red-500' : 'border-slate-700'}`}>
            <div className="flex items-start min-w-0">
                <input
                    type="checkbox"
                    checked={task.status === 'DONE'}
                    onChange={handleCheckboxChange}
                    className="h-6 w-6 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer flex-shrink-0 mt-1"
                />
                <div className="ml-4 min-w-0">
                    <p className={`font-semibold text-white ${task.status === 'DONE' ? 'line-through text-slate-500' : ''}`}>{task.title}</p>
                    {task.description && (
                      <div className="text-sm text-slate-400 mt-1">
                        {/* La classe 'whitespace-normal' garantit que le texte passera à la ligne */}
                        <p className="whitespace-normal">
                          {isExpanded ? task.description : `${task.description.substring(0, CHAR_LIMIT)}${needsTruncation ? '...' : ''}`}
                        </p>
                        {needsTruncation && (
                          <button onClick={() => setIsExpanded(!isExpanded)} className="text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-1">
                            {isExpanded ? 'Voir moins' : 'Voir plus'}
                          </button>
                        )}
                      </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col items-end text-sm ml-4 flex-shrink-0">
                <span className={`font-semibold whitespace-nowrap ${isOverdue ? 'text-red-400' : 'text-slate-300'}`}>
                    {new Date(task.deadline).toLocaleDateString('fr-FR')}
                </span>
                {isOverdue && <span className="text-xs text-red-500">En retard</span>}
            </div>
        </div>
    );
};


// --- Dashboard principal pour un employé ---
function EmployeeDashboard() {
  const {user, logout} = useContext(AuthContext); // Récupère l'utilisateur connecté et logout
  const [tasks, setTasks] = useState([]); // Liste des tâches
  const [isLoading, setIsLoading] = useState(true); // État de chargement
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menu mobile


  // --- Fetch des tâches de l'utilisateur au chargement ---
  useEffect(() => {
    const fetchTasks = async () => { 
      setIsLoading(true); // affiche un indicateur de chargement.
      const token = localStorage.getItem('token'); // Récupére le token JWT depuis localStorage
      if (!token) { logout(); return; }
      try {
        const res = await axios.get('/api/tasks/my-tasks', { // Requête Axios GET vers l'API POUR récupèrer uniquement les tâches de l’utilisateur
          headers: { Authorization: `Bearer ${token}` }, // Ajoute le token dans les en-têtes pour l'authentification
        });
        setTasks(res.data); // Met à jour l'état avec les tâches récupérées
      } catch (error) {
        console.error('Échec de la récupération des tâches', error);
        if (error.response?.status === 401) logout(); // Si le token est absent ou expiré, l’utilisateur est déconnecté automatiquement.
      } finally {
        setIsLoading(false); // Cache l'indicateur de chargement
      }
    };
    fetchTasks(); // Appelle la fonction pour fetch les tâches
  }, [logout]); // Le tableau de dépendances avec logout garantit que l'effet ne sera réexécuté que si logout change.


  // --- Mise à jour du statut d'une tâche ---
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const token = localStorage.getItem('token'); //Récupére le token JWT depuis localStorage pour authentifier la requête
    const originalTasks = [...tasks]; // Sauvegarde l'état original des tâches pour le rollback en cas d'erreur
    const updatedTasks = tasks.map(t => // Met à jour localement le statut de la tâche pour une réponse UI immédiate
      t.id === taskId ? { ...t, status: newStatus } : t // Si l'ID correspond, on met à jour le statut, sinon on garde la tâche inchangée
    );
    setTasks(updatedTasks); // Met à jour l'état avec les tâches modifiées
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } }); // Requête PATCH a partir de axios pour mettre à jour le statut de la tâche dans le backend
    } catch (error) {
      console.error('Échec de la mise à jour du statut de la tâche', error); // En cas d'erreur, on restaure l'état original des tâches
      setTasks(originalTasks);
      alert("La mise à jour de la tâche a échoué.");
    }
  };

  // --- Séparation des tâches et calcul des stats ---
  const tasksTodo = tasks.filter(t => t.status === 'TODO'); // filter() parcourt le tableau tasks et on garde uniquement les tâches dont le status est "TODO"
  const tasksDone = tasks.filter(t => t.status === 'DONE'); // filter() parcourt le tableau tasks et on garde uniquement les tâches dont le status est "DONE"
  const overdueTasks = tasksTodo.filter(t => new Date(t.deadline) < new Date());// On part du tableau tasksTodo (les tâches non terminées), on compare la date limite de chaque tâche (t.deadline) avec la date actuelle (new Date()). Si t.deadline est antérieure à aujourd’hui, c’est une tâche en retard


  // --- Rendu du dashboard ---
  return (
    <PrivateRoute allowedRoles={['EMPLOYEE']}>  {/* Protège la page pour les utilisateurs avec le rôle 'EMPLOYEE' */}
      <Head>
        <title>Mes Tâches - TaskFlow</title>
      </Head>
      <div className="min-h-screen bg-slate-900 text-slate-200">
        <nav className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold">
                <span className="text-[#2962FF]">Task</span><span className="text-[#4CAF50]">Flow</span> 
                <span className="font-normal text-slate-400"> / Espace Employé</span>
              </h1>

              <div className="hidden md:flex items-center">
                <Link href="/redirectToWp?destination=/" passHref>
                  <a target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-cyan-400 mr-6 text-sm font-medium transition-colors">
                    TaskFlow Hub
                  </a>
                </Link>
                <span className="text-slate-300 mr-4">Bonjour, {user?.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Déconnexion
                </button>
              </div>

              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300">
                  {isMenuOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
                </button>
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-slate-800 pb-4 px-4 space-y-4">
              <Link href="/redirectToWp?destination=/" passHref>
                <a target="_blank" rel="noopener noreferrer" className="block text-slate-300 hover:text-cyan-400 text-center py-2">
                  TaskFlow Hub
                </a>
              </Link>
              <div className="text-slate-300 text-center py-2 border-t border-slate-700">Bonjour, {user?.name}</div>
              <button
                onClick={logout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Déconnexion
              </button>
            </div>
          )}
        </nav>

        <main className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Tâches à faire" value={tasksTodo.length} icon={<ListBulletIcon className="w-6 h-6 text-cyan-400"/>} />
            <StatCard title="Tâches terminées" value={tasksDone.length} icon={<CheckCircleIcon className="w-6 h-6 text-cyan-400"/>} />
            <StatCard title="Tâches en retard" value={overdueTasks.length} icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-400"/>} />
          </div>
          
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Mes Tâches à faire</h2>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-slate-400">Chargement...</p>
              ) : tasksTodo.length > 0 ? (
                tasksTodo.map(task => <TaskItem key={task.id} task={task} onStatusChange={handleUpdateTaskStatus} />)
              ) : (
                <div className="bg-slate-800 p-6 text-center rounded-lg text-slate-400">
                  <p>Bravo, vous n&apos;avez aucune tâche en cours ! 🎉</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Tâches terminées</h2>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-slate-400">Chargement...</p>
              ) : tasksDone.length > 0 ? (
                tasksDone.map(task => <TaskItem key={task.id} task={task} onStatusChange={handleUpdateTaskStatus} />)
              ) : (
                <div className="bg-slate-800 p-6 text-center rounded-lg text-slate-400">
                  <p>Aucune tâche terminée pour le moment.</p>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </PrivateRoute>
  );
}

export default EmployeeDashboard;