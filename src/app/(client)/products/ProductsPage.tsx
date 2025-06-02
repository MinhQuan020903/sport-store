'use client';
import ProductCard from '@/components/ProductCard';
import { useProduct } from '@/hooks/useProduct';
import { useCategory } from '@/hooks/useCategory';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Footer } from '@/components/footer';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { sortOptions } from '@/config/products';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@nextui-org/react';
import { Spinner } from '@nextui-org/react';
import { AiOutlineFilter } from 'react-icons/ai';

interface ProductsPageProps {
  q: string | null;
  sort: string | null;
  categories: string | null;
  price_range: string | null;
}

export default function ProductsPage({
  q,
  sort,
  categories,
  price_range,
  ...props
}: ProductsPageProps) {
  const { onGetProducts } = useProduct();
  const { onGetCategories } = useCategory();

  // Fetch products with infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch: refetchData,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['products', q, sort, categories, price_range],
    ({ pageParam = 1 }) =>
      onGetProducts({
        page: pageParam,
        limit: 8,
        search: q || undefined,
        sortBy: sort?.split('.')[0] || 'createdAt',
        sortOrder: sort?.split('.')[1] || 'desc',
        categoryId: categories || undefined,
        minPrice: price_range ? Number(price_range.split('-')[0]) : undefined,
        maxPrice: price_range ? Number(price_range.split('-')[1]) : undefined,
      }),
    {
      staleTime: 1000 * 60 * 1,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.currentPage < lastPage.totalPages) {
          return lastPage.currentPage + 1;
        }
        return undefined;
      },
    }
  );

  // Fetch categories with React Query
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery(
    ['categories'],
    () => onGetCategories({ limit: 100 }),
    {
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  // Create query string
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  // Price filter
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    0, 5000000,
  ]);
  const debouncedPrice = useDebounce(priceRange, 500);

  React.useEffect(() => {
    const [min, max] = debouncedPrice;
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          price_range: `${min}-${max}`,
        })}`,
        {
          scroll: false,
        }
      );
    });
    refetchData();
  }, [debouncedPrice, createQueryString, pathname, router, refetchData]);

  // Category filter
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );

  React.useEffect(() => {
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          categories: selectedCategories?.length
            ? selectedCategories.join('.')
            : null,
        })}`,
        {
          scroll: false,
        }
      );
    });
    refetchData();
  }, [selectedCategories, createQueryString, pathname, router, refetchData]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Initialize selected categories from URL params
  React.useEffect(() => {
    if (categories) {
      const categoryIds = categories.split('.');
      setSelectedCategories(categoryIds);
    } else {
      setSelectedCategories([]);
    }
  }, [categories]);

  // Search bar
  const [searchQuery, setSearchQuery] = useState<string | null>(q ? q : '');
  const debouncedSearch = useDebounce(searchQuery, 500);

  React.useEffect(() => {
    const encodedSearchQuery = debouncedSearch
      ? encodeURI(debouncedSearch)
      : null;
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          q: encodedSearchQuery,
        })}`,
        {
          scroll: false,
        }
      );
    });
    refetchData();
  }, [debouncedSearch, createQueryString, pathname, router, refetchData]);

  return (
    <section className="flex flex-col space-y-6" {...props}>
      <div className="flex space-x-2 items-end px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              aria-label="Filter products"
              className="fixed top-[55px] left-50 w-[30px] h-[30px] z-50 p-2 rounded-full bg-white shadow-md hover:shadow-lg"
              disabled={isPending}
            >
              <div className="transform duration-200 hover:scale-105 flex items-center justify-center cursor-pointer">
                <AiOutlineFilter className="text-slate-600 w-6 h-6" />
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col">
            <SheetHeader className="px-1">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <Separator />
            <div className="flex flex-col lg:flex-row items-center space-x-0 lg:space-x-4 space-y-4 lg:space-y-0 ">
              <form className="flex justify-center w-5/6 h-8 rounded-md px-3">
                <input
                  value={searchQuery || ''}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="px-5 py-1 w-2/3 sm:px-5 sm:py-3 flex-1 text-zinc-800 bg-zinc-100 focus:bg-white rounded-full focus:outline-none focus:ring-[1px] focus:ring-black placeholder:text-zinc-400"
                  placeholder="What are you looking?"
                />
              </form>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="Sort products"
                    className="w-[60%] lg:w-auto h-6"
                    disabled={isPending}
                  >
                    Sort
                    <ChevronDownIcon
                      className="ml-2 h-4 w-4"
                      aria-hidden="true"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.label}
                      className={cn(option.value === sort && 'font-bold')}
                      onClick={() => {
                        startTransition(() => {
                          router.push(
                            `${pathname}?${createQueryString({
                              sort: option.value,
                            })}`,
                            {
                              scroll: false,
                            }
                          );
                        });
                      }}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Separator />
            <div className="flex flex-1 flex-col gap-5 overflow-hidden px-1">
              <div className="space-y-4">
                <h3 className="text-sm font-medium tracking-wide text-foreground">
                  Price range ($)
                </h3>
                <Slider
                  variant="range"
                  thickness="thin"
                  defaultValue={[0, 5000000]}
                  max={5000000}
                  step={1}
                  value={priceRange}
                  onValueChange={(value: typeof priceRange) =>
                    setPriceRange(value)
                  }
                />
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={priceRange[1]}
                    className="h-9"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setPriceRange([value, priceRange[1]]);
                    }}
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={priceRange[0]}
                    max={5000000}
                    className="h-9"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setPriceRange([priceRange[0], value]);
                    }}
                  />
                </div>
              </div>

              <ScrollArea className="my-2 h-[calc(100vh-8rem)] pb-10 pl-6 pr-5">
                <div className="space-y-4">
                  <Accordion
                    type="multiple"
                    className="w-full overflow-auto no-scrollbar"
                  >
                    <AccordionItem value="categories">
                      <AccordionTrigger className="text-sm">
                        Categories
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col">
                          {isLoadingCategories ? (
                            <Spinner size="sm" />
                          ) : (
                            categoriesData?.items?.map((category) => (
                              <Checkbox
                                key={category.id}
                                isSelected={selectedCategories.includes(
                                  category.id
                                )}
                                onChange={() => toggleCategory(category.id)}
                              >
                                {category.name}
                              </Checkbox>
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </ScrollArea>
            </div>
            <div>
              <Separator className="my-4" />
              <SheetFooter>
                <Button
                  aria-label="Clear filters"
                  size="sm"
                  className="w-auto md:w-full pr-5"
                  onClick={() => {
                    startTransition(() => {
                      router.push('/products');
                      setPriceRange([0, 5000000]);
                      setSelectedCategories([]);
                    });
                  }}
                  disabled={isPending}
                >
                  Clear Filters
                </Button>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {!isPending &&
      (!data?.pages?.[0]?.items || data.pages[0].items.length === 0) ? (
        <div className="mx-auto flex max-w-xs flex-col space-y-1.5">
          <h1 className="text-center text-2xl font-bold">No products found</h1>
          <p className="text-center text-muted-foreground">
            Try changing your filters, or check back later for new products
          </p>
        </div>
      ) : null}

      {isFetching && !isFetchingNextPage ? (
        <div className="w-full h-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-hidden">
          {data?.pages?.length > 0 ? (
            <InfiniteScroll
              loader={
                <div className="w-full h-full flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              }
              data-testid="infinite-scroll"
              scrollableTarget="scrollableDiv"
              style={{ overflow: 'hidden' }}
              inverse={false}
              hasChildren={true}
              pullDownToRefresh={false}
              pullDownToRefreshThreshold={50}
              releaseToRefreshContent={
                <div className="text-center">Release to refresh</div>
              }
              endMessage={
                <p className="text-center text-muted-foreground">
                  <b>Yay! You have seen it all</b>
                </p>
              }
              dataLength={data.pages.reduce(
                (acc, page) => acc + (page.items?.length || 0),
                0
              )}
              next={() => fetchNextPage()}
              hasMore={hasNextPage || false}
              className="h-full"
            >
              <div className="px-4">
                {data.pages?.map((page, pageIndex) => (
                  <div
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    key={pageIndex}
                  >
                    {Array.isArray(page)
                      ? page.map((product, productIndex) => (
                          <ProductCard
                            product={product}
                            key={
                              product.id ||
                              `product-${pageIndex}-${productIndex}`
                            }
                          />
                        ))
                      : null}
                  </div>
                ))}
              </div>
              {isFetchingNextPage ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : null}
              <Footer />
            </InfiniteScroll>
          ) : null}
        </div>
      )}
    </section>
  );
}
