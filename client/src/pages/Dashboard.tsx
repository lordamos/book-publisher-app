import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, BookOpen, Clock, FileText } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState(user?.name || "");

  const booksQuery = trpc.books.list.useQuery();
  const createBookMutation = trpc.books.create.useMutation();

  const handleCreateBook = async () => {
    try {
      const result = await createBookMutation.mutateAsync({
        title: title || "Untitled Book",
        description,
        author,
      });
      
      if (result && "insertId" in result) {
        const bookId = Number((result as any).insertId);
        navigate(`/editor/${bookId}`);
      }
      
      setTitle("");
      setDescription("");
      setIsOpen(false);
      booksQuery.refetch();
    } catch (error) {
      console.error("Failed to create book:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Your Books</h1>
            <p className="text-muted-foreground mt-2">Create, edit, and publish your stories</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a New Book</DialogTitle>
                <DialogDescription>
                  Start your publishing journey by creating a new book project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Book Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter book title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author Name</Label>
                  <Input
                    id="author"
                    placeholder="Your name"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your book"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateBook}
                  disabled={createBookMutation.isPending}
                  className="w-full"
                >
                  {createBookMutation.isPending ? "Creating..." : "Create Book"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Books Grid */}
        {booksQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-muted" />
            ))}
          </div>
        ) : booksQuery.data && booksQuery.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {booksQuery.data.map((book) => (
              <Card
                key={book.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/editor/${book.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <BookOpen className="w-10 h-10 text-primary/60 group-hover:text-primary transition-colors" />
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {book.status}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{book.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {book.pageCount} pages
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(book.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No books yet</h3>
            <p className="text-muted-foreground mb-6">Create your first book to get started</p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Book
                </Button>
              </DialogTrigger>
            </Dialog>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
