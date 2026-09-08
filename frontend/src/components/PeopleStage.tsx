import { useState, useEffect } from 'react';
import type { Person } from '../types';
import { Plus, X, User, Trash2, Users } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface PeopleStageProps {
  people: Person[];
  onNext: (people: Person[]) => void;
  onBack: () => void;
}

interface Group {
  id: string;
  name: string;
  members: { name: string, default_share_type: string }[];
}

export default function PeopleStage({ people, onNext, onBack }: PeopleStageProps) {
  const [localPeople, setLocalPeople] = useState<Person[]>(
    people.length > 0 ? people : [{ id: '1', name: 'Me' }]
  );
  
  const { user, token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [showSaveGroup, setShowSaveGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && token) {
      const fetchGroups = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || '';
          const res = await fetch(`${apiUrl}/api/groups`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setGroups(data);
          }
        } catch (e) {
          console.error('Failed to fetch groups', e);
        }
      };
      fetchGroups();
    }
  }, [user, token]);

  const loadGroup = (group: Group) => {
    const newPeople = group.members.map((m, i) => ({
      id: Date.now().toString() + i,
      name: m.name
    }));
    setLocalPeople(newPeople);
  };

  const saveGroup = async () => {
    if (!newGroupName.trim() || !user || !token) return;
    setIsSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const members = localPeople.filter(p => p.name.trim()).map(p => p.name.trim());
      
      const res = await fetch(`${apiUrl}/api/groups`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newGroupName,
          members
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setGroups([...groups, data]);
        setShowSaveGroup(false);
        setNewGroupName('');
      }
    } catch (e) {
      console.error('Failed to save group', e);
    } finally {
      setIsSaving(false);
    }
  };

  const addPerson = () => {
    setLocalPeople([...localPeople, { id: Date.now().toString(), name: '' }]);
  };

  const removePerson = (id: string) => {
    setLocalPeople(localPeople.filter(p => p.id !== id));
  };

  const updatePersonName = (id: string, name: string) => {
    setLocalPeople(localPeople.map(p => p.id === id ? { ...p, name } : p));
  };

  const handleNext = () => {
    const validPeople = localPeople.filter(p => p.name.trim() !== '');
    if (validPeople.length > 0) {
      onNext(validPeople);
    }
  };

  const isValid = localPeople.filter(p => p.name.trim() !== '').length > 0;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Who was there?</h2>
        <p className="text-text-secondary">Add everyone who will be splitting the bill.</p>
      </div>

      {user ? (
        <div className="glass-panel p-4 mb-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <Users size={16} /> Saved Groups
          </h3>
          {groups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => loadGroup(group)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-subtle-bg hover:border-brand-primary hover:text-brand-primary transition-colors text-sm font-medium"
                >
                  {group.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary/70 italic">
              No saved groups yet. Add people below and save them as a group for quick selection next time!
            </p>
          )}
        </div>
      ) : (
        <div className="glass-panel p-4 mb-6">
          <p className="text-xs text-text-secondary/70 italic">
            Log in to create and quickly select saved groups of friends.
          </p>
        </div>
      )}

      <div className="glass-panel p-2 flex flex-col gap-2">
        {localPeople.map((person, index) => (
          <div key={person.id} className="flex items-center gap-3 p-2 group transition-all">
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
              <User size={16} className="text-brand-primary" />
            </div>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={person.name}
                onChange={(e) => updatePersonName(person.id, e.target.value)}
                placeholder={`Person ${index + 1}`}
                className="w-full bg-transparent border-b border-border/50 px-2 py-2 focus:outline-none focus:border-brand-primary transition-colors text-text-primary placeholder:text-text-secondary/50 font-medium"
                autoFocus={index === localPeople.length - 1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addPerson();
                  }
                }}
              />
            </div>
            
            {localPeople.length > 1 && (
              <button
                onClick={() => removePerson(person.id)}
                className="p-2 text-text-secondary/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                aria-label="Remove person"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addPerson}
          className="flex items-center gap-2 mx-2 my-2 text-brand-primary font-medium p-2 hover:bg-brand-primary/5 rounded-lg transition-colors w-fit"
        >
          <Plus size={18} />
          <span>Add Person</span>
        </button>
      </div>

      {user && localPeople.filter(p => p.name.trim() !== '').length > 0 && (
        <div className="glass-panel p-4">
          {!showSaveGroup ? (
            <button 
              onClick={() => setShowSaveGroup(true)}
              className="text-sm font-medium text-brand-primary flex items-center gap-1"
            >
              <Plus size={16} /> Save current people as Group
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input 
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group Name (e.g. Work Friends)"
                className="flex-1 bg-subtle-bg border border-border rounded-lg px-3 py-1.5 text-sm"
              />
              <button onClick={saveGroup} disabled={isSaving || !newGroupName.trim()} className="bg-brand-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                Save
              </button>
              <button onClick={() => setShowSaveGroup(false)} className="p-1.5 text-text-secondary hover:text-text-primary">
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-surface-panel transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`glass-button px-8 py-2.5 ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
