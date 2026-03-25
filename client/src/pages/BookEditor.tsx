import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BookEditorCanvas } from "@/components/BookEditorCanvas";
import { BookEditorToolbar } from "@/components/BookEditorToolbar";
import { BookEditorSidebar } from "@/components/BookEditorSidebar";

export default function BookEditor() {
  const { bookId } = useParams<{ bookId: string }>();
  const bookIdNum = parseInt(bookId || "0", 10);
  
  const bookQuery = trpc.books.get.useQuery({ bookId: bookIdNum });
  const pagesQuery = trpc.pages.list.useQuery({ bookId: bookIdNum });
  const chaptersQuery = trpc.chapters.list.useQuery({ bookId: bookIdNum });
  const metadataQuery = trpc.metadata.get.useQuery({ bookId: bookIdNum });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElements, setSelectedElements] = useState<number[]>([]);

  if (bookQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your book...</p>
        </div>
      </div>
    );
  }

  if (!bookQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Book not found</h1>
          <p className="text-muted-foreground">The book you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const book = bookQuery.data;
  const pages = pagesQuery.data || [];
  const currentPage = pages[currentPageIndex];

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col gap-4 p-4">
        {/* Toolbar */}
        <BookEditorToolbar
          book={book}
          currentPageIndex={currentPageIndex}
          totalPages={pages.length}
          onPageChange={setCurrentPageIndex}
        />

        {/* Main Editor Area */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center bg-muted rounded-lg overflow-hidden">
            {currentPage ? (
              <BookEditorCanvas
                page={currentPage}
                bookId={bookIdNum}
                onElementSelect={setSelectedElements}
                selectedElements={selectedElements}
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <p>No pages yet. Create a new page to start editing.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <BookEditorSidebar
            book={book}
            currentPage={currentPage}
            selectedElements={selectedElements}
            chapters={chaptersQuery.data || []}
            metadata={metadataQuery.data}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
