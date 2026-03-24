import { useState, useCallback } from 'react';
import Navigation from './components/Navigation';
import HomeView from './components/views/HomeView';
import LibraryView from './components/views/LibraryView';
import ShelfView from './components/views/ShelfView';
import ChapterView from './components/views/ChapterView';
import ReaderView from './components/views/ReaderView';
import SearchView from './components/views/SearchView';
import SettingsView from './components/views/SettingsView';
import { useUserData } from './hooks/useUserData';
import { INITIAL_LIBRARY } from './utils/constants';

// Navigation stack entry: { view, params }
function useNavStack() {
  const [stack, setStack] = useState([{ view: 'home', params: {} }]);
  const current = stack[stack.length - 1];

  const navigate = useCallback((view, params = {}) => {
    setStack(prev => [...prev, { view, params }]);
  }, []);

  const back = useCallback(() => {
    setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, []);

  const jumpTo = useCallback((view, params = {}) => {
    setStack([{ view, params }]);
  }, []);

  return { current, stack, navigate, back, jumpTo, canBack: stack.length > 1 };
}

function getViewTitle(view, params) {
  if (view === 'chapter') {
    const book = INITIAL_LIBRARY.find(b => b.id === params.bookId);
    return book?.title || '';
  }
  if (view === 'reader') {
    const book = INITIAL_LIBRARY.find(b => b.id === params.bookId);
    return book ? `${book.title} ${params.chapter}` : '';
  }
  return null; // shows "Lumina" logo
}

export default function App() {
  const userData = useUserData();
  const { current, navigate, back, jumpTo, canBack } = useNavStack();

  const handleNavigate = useCallback((view, params = {}) => {
    const rootViews = ['home', 'library', 'shelf', 'search', 'settings'];
    if (rootViews.includes(view)) {
      jumpTo(view, params);
    } else {
      navigate(view, params);
    }
  }, [navigate, jumpTo]);

  const { view, params } = current;
  const title = getViewTitle(view, params);

  const themeClass = userData.settings?.theme === 'light'
    ? 'bg-stone-50 text-stone-900'
    : userData.settings?.theme === 'grey'
    ? 'bg-neutral-900 text-neutral-100'
    : 'bg-zinc-950 text-zinc-100';

  return (
    <div className={`min-h-screen ${themeClass} transition-colors`}>
      <Navigation
        view={view}
        onNavigate={handleNavigate}
        title={title}
        onBack={back}
        canBack={canBack && !['home','library','shelf','search','settings'].includes(view)}
        user={userData.user}
      />

      <main>
        {view === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            history={userData.history}
            readCount={userData.readCount}
            currentBadge={userData.currentBadge}
            library={userData.library}
          />
        )}
        {view === 'library' && (
          <LibraryView
            onNavigate={handleNavigate}
            isInLibrary={userData.isInLibrary}
          />
        )}
        {view === 'shelf' && (
          <ShelfView
            library={userData.library}
            onNavigate={handleNavigate}
            removeFromLibrary={userData.removeFromLibrary}
            settings={userData.settings}
          />
        )}
        {view === 'chapter' && params.bookId && (
          <ChapterView
            bookId={params.bookId}
            onNavigate={handleNavigate}
            isChapterRead={userData.isChapterRead}
            isInLibrary={userData.isInLibrary}
            addToLibrary={userData.addToLibrary}
            settings={userData.settings}
          />
        )}
        {view === 'reader' && params.bookId && (
          <ReaderView
            bookId={params.bookId}
            chapter={params.chapter || 1}
            onNavigate={handleNavigate}
            isChapterRead={userData.isChapterRead}
            markChapterRead={userData.markChapterRead}
            unmarkChapterRead={userData.unmarkChapterRead}
            addToHistory={userData.addToHistory}
            saveNote={userData.saveNote}
            getNote={userData.getNote}
            settings={userData.settings}
            updateSettings={userData.updateSettings}
          />
        )}
        {view === 'search' && (
          <SearchView onNavigate={handleNavigate} />
        )}
        {view === 'settings' && (
          <SettingsView
            user={userData.user}
            signInGoogle={userData.signInGoogle}
            signInGuest={userData.signInGuest}
            logOut={userData.logOut}
            settings={userData.settings}
            updateSettings={userData.updateSettings}
            readCount={userData.readCount}
            currentBadge={userData.currentBadge}
          />
        )}
      </main>
    </div>
  );
}
