
"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Note, User, NotePrivacy } from "@/types";
import { getVisibleNotes, createNote, deleteNote, getAllUsers } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StickyNote, Package2, PlusCircle, Trash2, Users, Lock, Globe, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [notes, setNotes] = React.useState<Note[]>([]);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  // New Note Dialog State
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newNoteContent, setNewNoteContent] = React.useState("");
  const [newNotePrivacy, setNewNotePrivacy] = React.useState<NotePrivacy>("private");
  const [newNoteSharedWith, setNewNoteSharedWith] = React.useState<User[]>([]);

  // Delete Confirmation Dialog State
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = React.useState(false);
  const [noteToDelete, setNoteToDelete] = React.useState<Note | null>(null);

  const fetchNotesAndUsers = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fetchedNotes, fetchedUsers] = await Promise.all([
        getVisibleNotes(user.email),
        getAllUsers(),
      ]);
      setNotes(fetchedNotes);
      setAllUsers(fetchedUsers.filter(u => u.id !== user.id)); // Exclude current user from sharing list
    } catch (error) {
      toast({ title: "Error", description: "Failed to load notes or users.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  React.useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/auth/signin");
      } else {
        fetchNotesAndUsers();
      }
    }
  }, [user, authLoading, router, fetchNotesAndUsers]);

  const resetNewNoteForm = () => {
    setNewNoteContent("");
    setNewNotePrivacy("private");
    setNewNoteSharedWith([]);
  };

  const handleCreateNote = async () => {
    if (!newNoteContent.trim() || !user) {
      toast({ title: "Error", description: "Note content cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const notePayload: Partial<Note> = {
      content: newNoteContent,
      privacy: newNotePrivacy,
      sharedWith: newNotePrivacy === 'shared' ? newNoteSharedWith.map(u => ({ userId: u.id, userName: u.name, email: u.email })) : [],
    };

    try {
      await createNote(notePayload, user.email);
      toast({ title: "Note Created", description: "Your new note has been saved." });
      await fetchNotesAndUsers();
      setIsNewNoteDialogOpen(false);
      resetNewNoteForm();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create note.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteRequest = (note: Note) => {
    setNoteToDelete(note);
    setIsConfirmDeleteDialogOpen(true);
  };
  
  const confirmDeleteNote = async () => {
    if (!noteToDelete || !user) return;
    setIsSubmitting(true); // Reuse submitting state for deletion
    try {
      await deleteNote(noteToDelete.id, user.email);
      toast({ title: "Note Deleted", description: "The note has been successfully deleted." });
      setNotes(prev => prev.filter(n => n.id !== noteToDelete.id));
      setNoteToDelete(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete note. You may not have permission.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setIsConfirmDeleteDialogOpen(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading notes...</p>
      </div>
    );
  }

  const PrivacyIcon = ({ privacy }: { privacy: NotePrivacy }) => {
    switch (privacy) {
      case 'public': return <Globe className="h-4 w-4 text-blue-500" />;
      case 'private': return <Lock className="h-4 w-4 text-red-500" />;
      case 'shared': return <Users className="h-4 w-4 text-green-500" />;
      default: return <UserIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  return (
    <>
      <section className="notes-content flex flex-col gap-6" aria-labelledby="notes-heading">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 id="notes-heading" className="text-2xl font-semibold md:text-3xl flex items-center gap-2">
            <StickyNote className="h-7 w-7" /> Notes
          </h1>
          <Dialog open={isNewNoteDialogOpen} onOpenChange={(isOpen) => {
              setIsNewNoteDialogOpen(isOpen);
              if (!isOpen) resetNewNoteForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
                <DialogDescription>Write your note and set its privacy level.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="note-content">Content</Label>
                  <Textarea id="note-content" rows={6} value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} placeholder="Type your note here..." disabled={isSubmitting} />
                </div>
                <div className="space-y-3">
                  <Label>Privacy</Label>
                  <RadioGroup value={newNotePrivacy} onValueChange={(val) => setNewNotePrivacy(val as NotePrivacy)} className="flex space-x-4" disabled={isSubmitting}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="private" id="r1" /><Label htmlFor="r1">Private</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="public" id="r2" /><Label htmlFor="r2">Public</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="shared" id="r3" /><Label htmlFor="r3">Shared</Label></div>
                  </RadioGroup>
                </div>
                {newNotePrivacy === 'shared' && (
                  <div className="space-y-2 pt-2">
                    <Label>Share with</Label>
                     <Card className="border">
                        <ScrollArea className="h-48">
                            <CardContent className="p-2 space-y-1">
                                {allUsers.length > 0 ? allUsers.map(u => (
                                    <div key={u.id} className="flex items-center space-x-2 p-1 rounded-md hover:bg-accent">
                                        <Checkbox 
                                            id={`user-${u.id}`}
                                            checked={newNoteSharedWith.some(su => su.id === u.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setNewNoteSharedWith(prev => [...prev, u]);
                                                } else {
                                                    setNewNoteSharedWith(prev => prev.filter(su => su.id !== u.id));
                                                }
                                            }}
                                            disabled={isSubmitting}
                                        />
                                        <Label htmlFor={`user-${u.id}`} className="font-normal flex-1 cursor-pointer">{u.name} <span className="text-muted-foreground">({u.email})</span></Label>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground text-center p-2">No other users to share with.</p>}
                            </CardContent>
                        </ScrollArea>
                     </Card>
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
                <Button onClick={handleCreateNote} disabled={isSubmitting || !newNoteContent.trim()}>
                  {isSubmitting ? "Saving..." : "Save Note"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No notes to display. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map(note => (
              <Card key={note.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${note.authorName.substring(0,1)}`} alt={note.authorName} data-ai-hint="user avatar" />
                        <AvatarFallback>{note.authorName.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-md">{note.authorName}</CardTitle>
                        <CardDescription className="text-xs">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </CardDescription>
                      </div>
                    </div>
                    {(user?.id === note.authorId || user?.role !== "Member") && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteRequest(note)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete note</span>
                        </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between text-xs text-muted-foreground pt-4">
                  <Badge variant="outline" className="capitalize flex items-center gap-1.5">
                    <PrivacyIcon privacy={note.privacy} />
                    {note.privacy}
                  </Badge>
                  {note.privacy === 'shared' && note.sharedWith.length > 0 && (
                    <p>{note.sharedWith.length} member{note.sharedWith.length > 1 ? 's' : ''}</p>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteNote} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
