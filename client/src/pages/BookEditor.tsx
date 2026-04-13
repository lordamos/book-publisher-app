import { useParams } from "wouter";
import { Page } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BookEditorCanvas } from "@/components/BookEditorCanvas";
import { BookEditorToolbar } from "@/components/BookEditorToolbar";
import { BookEditorSidebar } from "@/components/BookEditorSidebar";
import { PageManagementSidebar } from "@/components/PageManagementSidebar";
import { duplicatePage, deletePage, addPageAfter } from "@/lib/pageManagement";

export default function BookEditor() {
  const { bookId } = useParams<{ bookId: string }>();
  const bookIdNum = parseInt(bookId || "0", 10);
  
  const bookQuery = trpc.books.get.useQuery({ bookId: bookIdNum });
  const pagesQuery = trpc.pages.list.useQuery({ bookId: bookIdNum });
  const chaptersQuery = trpc.chapters.list.useQuery({ bookId: bookIdNum });
  const metadataQuery = trpc.metadata.get.useQuery({ bookId: bookIdNum });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElements, setSelectedElements] = useState<number[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  
  const createPageMutation = trpc.pages.create.useMutation();
  const updatePageMutation = trpc.pages.update.useMutation();

  useEffect(() => {
    if (pagesQuery.data) {
      setPages(pagesQuery.data);
    }
  }, [pagesQuery.data]);

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
  const currentPage = pages[currentPageIndex];
  const currentPageId = currentPage?.id || 0;

  const handleSelectPage = (pageId: number) => {
    const index = pages.findIndex((p) => p.id === pageId);
    if (index !== -1) {
      setCurrentPageIndex(index);
    }
  };

  const handleDeletePage = (pageId: number) => {
    if (pages.length === 1) {
      alert("Cannot delete the last page");
      return;
    }
    
    updatePageMutation.mutate({ pageId, data: { content: null } }, {
      onSuccess: () => {
        const newPages = deletePage(pages, pageId);
        setPages(newPages);
        if (currentPageIndex >= newPages.length) {
          setCurrentPageIndex(newPages.length - 1);
        }
      },
    });
  };

  const handleDuplicatePage = (pageId: number) => {
    const newPages = duplicatePage(pages, pageId);
    const newPage = newPages[newPages.length - 1];
    
    createPageMutation.mutate({
      bookId: bookIdNum,
      pageNumber: newPage.pageNumber,
      templateType: "blank",
      content: newPage.content || JSON.stringify({ textBlocks: [], images: [] }),
    }, {
      onSuccess: () => {
        pagesQuery.refetch();
      },
    });
  };

  const handleAddPageAfter = (pageId: number) => {
    const pageIndex = pages.findIndex((p) => p.id === pageId);
    if (pageIndex === -1) return;
    
    createPageMutation.mutate({
      bookId: bookIdNum,
      pageNumber: pageIndex + 2,
      templateType: "blank",
      content: JSON.stringify({ textBlocks: [], images: [] }),
    }, {
      onSuccess: () => {
        pagesQuery.refetch();
      },
    });
  };

  const handleAddNewPage = () => {
    createPageMutation.mutate({
      bookId: bookIdNum,
      pageNumber: pages.length + 1,
      templateType: "blank",
      content: JSON.stringify({ textBlocks: [], images: [] }),
    }, {
      onSuccess: () => {
        pagesQuery.refetch();
      },
    });
  };

  const handleReorderPages = (newPages: Page[]) => {
    setPages(newPages);
    // Reordering is handled by the sidebar drag-and-drop
    // Individual page order updates can be handled separately if needed
  };

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col gap-4 p-4">
        {/* Toolbar */}
        <BookEditorToolbar
          book={book}
          currentPageIndex={currentPageIndex}
          totalPages={pages.length}
          onPageChange={setCurrentPageIndex}
          onAddNewPage={handleAddNewPage}
        />

        {/* Main Editor Area */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Page Management Sidebar */}
          <PageManagementSidebar
            pages={pages}
            selectedPageId={currentPageId}
            onSelectPage={handleSelectPage}
            onDeletePage={handleDeletePage}
            onDuplicatePage={handleDuplicatePage}
            onAddPageAfter={handleAddPageAfter}
            onAddNewPage={handleAddNewPage}
            onReorderPages={handleReorderPages}
          />

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

          {/* Right Sidebar */}
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
