'use client';

import React from 'react';
import { type Show, type NavItem } from '@/types';
import Link from 'next/link';
import {
  cn,
  getSearchValue,
  handleDefaultSearchBtn,
  handleDefaultSearchInp,
} from '@/lib/utils';
import { siteConfig } from '@/configs/site';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSearchStore } from '@/stores/search';
import { ModeToggle as ThemeToggle } from '@/components/theme-toggle';
import { DebouncedInput } from '@/components/debounced-input';
import MovieService from '@/services/MovieService';

interface MainNavProps {
  items?: NavItem[];
}

interface SearchResult {
  results: Show[];
}

export function MainNav({ items }: MainNavProps) {
  const path = usePathname();
  const router = useRouter();
  // search store
  const searchStore = useSearchStore();
  const [isScrolled, setIsScrolled] = React.useState(false);

  const searchParams = useSearchParams();
  const qParam = searchParams.get('q');

  React.useEffect(() => {
    if (!qParam) {
      searchStore.reset();
      searchStore.setOpen(false);
    } else {
      searchStore.setOpen(true);
      searchStore.setLoading(true);
      searchStore.setQuery(qParam);
      setTimeout(() => {
        handleDefaultSearchBtn();
      }, 10);
      setTimeout(() => {
        handleDefaultSearchInp();
      }, 20);
      MovieService.searchMovies(qParam)
        .then((response: SearchResult) => {
          void searchStore.setShows(response.results);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => searchStore.setLoading(false));
    }
  }, [qParam]);

  async function searchShowsByQuery(value: string) {
    if (!value?.trim()?.length) {
      if (path === '/search') {
        router.push('/home');
      } else {
        router.push(path, { scroll: false });
      }
      return;
    }

    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set('q', value);
    router.push(`search?${newSearchParams.toString()}`, { scroll: false });

    // Instantly update UI for snappy feedback
    searchStore.setQuery(value);
    searchStore.setLoading(true);
    const shows = await MovieService.searchMovies(value);
    searchStore.setLoading(false);
    void searchStore.setShows(shows.results);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // change background color on scroll
  React.useEffect(() => {
    let ticking = false;
    const changeBgColor = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', changeBgColor, { passive: true });
    return () => window.removeEventListener('scroll', changeBgColor);
  }, []);

  const handleChangeStatusOpen = (value: boolean): void => {
    searchStore.setOpen(value);
    if (!value) searchStore.reset();
  };

  return (
    <nav
      className={cn(
        'relative flex h-12 w-full items-center justify-between bg-gradient-to-b from-secondary/70 from-10% px-[4vw] transition-colors duration-300 md:sticky md:h-16',
        isScrolled ? 'bg-secondary shadow-md' : 'bg-transparent',
      )}>
      <div className="flex items-center gap-6 md:gap-10">
        <Link
          href="/"
          className="hidden md:block"
          onClick={() => handleChangeStatusOpen(false)}>
          <div className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" aria-hidden="true" />
            <span className="inline-block font-bold">{siteConfig.name}</span>
            <span className="sr-only">Home</span>
          </div>
        </Link>
        {items?.length ? (
          <nav className="hidden gap-6 md:flex">
            {items?.map(
              (item, index) =>
                item.href && (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      'flex items-center text-sm font-medium text-foreground/60 transition hover:text-foreground/80',
                      path === item.href && 'font-bold text-foreground',
                      item.disabled && 'cursor-not-allowed opacity-80',
                    )}
                    onClick={() => handleChangeStatusOpen(false)}>
                    {item.title}
                  </Link>
                ),
            )}
          </nav>
        ) : null}
        <div className="block md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 px-0 hover:bg-transparent focus:ring-0"
                // className="h-auto px-2 py-1.5 text-base hover:bg-neutral-800 focus:ring-0 dark:hover:bg-neutral-800 lg:hidden"
              >
                <Icons.logo className="h-6 w-6" />
                <span className="text-base font-bold">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={20}
              // className="w-52 overflow-y-auto overflow-x-hidden rounded-sm bg-neutral-800 text-slate-200 dark:bg-neutral-800 dark:text-slate-200"
              className="w-52 overflow-y-auto overflow-x-hidden rounded-sm">
              <DropdownMenuLabel>
                <Link
                  href="/"
                  className="flex items-center justify-center"
                  onClick={() => handleChangeStatusOpen(false)}>
                  {/* <Icons.logo */}
                  {/*   className="mr-2 h-4 w-4 text-red-600" */}
                  {/*   aria-hidden="true" */}
                  {/* /> */}
                  <span className="">{siteConfig.name}</span>
                </Link>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {items?.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  asChild
                  className="items-center justify-center">
                  {item.href && (
                    <Link
                      href={item.href}
                      onClick={() => handleChangeStatusOpen(false)}>
                      {/* {item.icon &&  */}
                      {/*   <item.icon className="mr-2 h-4 w-4" aria-hidden="true" /> */}
                      {/* } */}
                      <span
                        className={cn(
                          'line-clamp-1 text-foreground/60 hover:text-foreground/80',
                          path === item.href && 'font-bold text-foreground',
                        )}>
                        {item.title}
                      </span>
                    </Link>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <DebouncedInput
          id="search-input"
          open={searchStore.isOpen}
          value={searchStore.query}
          onChange={searchShowsByQuery}
          onChangeStatusOpen={handleChangeStatusOpen}
          containerClassName={cn(path === '/' ? 'hidden' : 'flex')}
        />
        <Link
          rel="noreferrer"
          target="_blank"
          href={siteConfig.links.github}
          className={cn(path === '/' ? 'flex' : 'hidden')}>
          <Icons.gitHub className="h-5 w-5 hover:bg-transparent" />
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}

export default MainNav;
