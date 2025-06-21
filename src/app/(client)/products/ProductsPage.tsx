'use client';
import ProductCard from '@/components/ProductCard';
import { useProduct } from '@/hooks/useProduct';
import { useCategory } from '@/hooks/useCategory';
import { useQuery } from '@tanstack/react-query';
import { Footer } from '@/components/footer';
import React, { useState, useEffect, useCallback, useTransition } from 'react';
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
import { Checkbox, Pagination, Spinner } from '@nextui-org/react';
import { AiOutlineFilter } from 'react-icons/ai';
import Loader from '@/components/Loader';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  // Create query string
  const createQueryString = useCallback(
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

  // Price filter - changed to use null for the max price initially
  const [priceRange, setPriceRange] = useState<[number, number | null]>([
    0,
    null,
  ]);
  const debouncedPrice = useDebounce(priceRange, 500);

  // Category filter
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Search bar
  const [searchQuery, setSearchQuery] = useState<string | null>(q || '');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch products with pagination
  const {
    data: productsData,
    isLoading,
    refetch: refetchProducts,
  } = useQuery(
    [
      'products',
      debouncedSearch,
      sort,
      selectedCategories,
      debouncedPrice[0],
      debouncedPrice[1],
      currentPage,
    ],
    async () => {
      // Create params object for API call
      const params: any = {
        page: currentPage,
        limit: pageSize,
        sortBy: sort?.split('.')[0] || 'createdAt',
        sortOrder: sort?.split('.')[1] || 'desc',
      };

      // Only add parameters if they have valid values
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategories.length > 0)
        params.categoryId = selectedCategories.join('.');
      if (debouncedPrice[0] > 0) params.minPrice = debouncedPrice[0];
      if (debouncedPrice[1] !== null) params.maxPrice = debouncedPrice[1];

      return onGetProducts(params);
    },
    {
      staleTime: 1000 * 60 * 1, // 1 minute
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery(
    ['categories'],
    () => onGetCategories({ limit: 100 }),
    {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    }
  );

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Update URL when filters change
  useEffect(() => {
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          q: debouncedSearch || null,
          // Only include price_range if maxPrice is not null
          price_range:
            debouncedPrice[1] !== null
              ? `${debouncedPrice[0]}-${debouncedPrice[1]}`
              : debouncedPrice[0] > 0
              ? `${debouncedPrice[0]}-`
              : null,
          categories:
            selectedCategories.length > 0 ? selectedCategories.join('.') : null,
          sort: sort || null,
          page: currentPage,
        })}`,
        { scroll: false }
      );
    });
  }, [
    debouncedSearch,
    debouncedPrice,
    selectedCategories,
    sort,
    currentPage,
    pathname,
    router,
    createQueryString,
  ]);

  // Initialize filters from URL params
  useEffect(() => {
    if (categories) {
      setSelectedCategories(categories.split('.'));
    }

    if (price_range) {
      const [min, max] = price_range.split('-').map(Number);
      setPriceRange([min, max]);
    }

    if (q) {
      setSearchQuery(q);
    }
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearFilters = () => {
    setPriceRange([0, null]);
    setSelectedCategories([]);
    setSearchQuery('');
    setCurrentPage(1);
    router.push('/products');
  };

  // Extract products and total pages with improved response handling
  const formatProductsData = (data) => {
    // Handle direct array response
    if (Array.isArray(data)) {
      console.log('Response is an array of products:', data.length);
      return {
        products: data,
        totalPages: 1, // No pagination info in direct array
        hasProducts: data.length > 0,
      };
    }
    // Handle paginated response with items array
    else if (data?.items && Array.isArray(data.items)) {
      console.log('Response has items array:', data.items.length);
      return {
        products: data.items,
        totalPages:
          data.totalPages || Math.ceil(data.totalCount / pageSize) || 1,
        hasProducts: data.items.length > 0,
      };
    }
    // Handle response with data property containing array
    else if (data?.data && Array.isArray(data.data)) {
      console.log('Response has data array:', data.data.length);
      return {
        products: data.data,
        totalPages:
          data.totalPages || Math.ceil(data.totalCount / pageSize) || 1,
        hasProducts: data.data.length > 0,
      };
    }
    // Default empty case
    else {
      console.warn('Unexpected response format:', data);
      return {
        products: [],
        totalPages: 1,
        hasProducts: false,
      };
    }
  };

  // Process the response data
  const { products, totalPages, hasProducts } =
    formatProductsData(productsData);

  // Debug output to help identify the issue
  useEffect(() => {
    if (productsData) {
      console.log('Raw API Response:', productsData);
      console.log('Processed Products:', products);
      console.log('Has Products:', hasProducts);
    }
  }, [productsData]);

  return (
    <section className="flex flex-col space-y-6 pb-10" {...props}>
      {/* Filters and Search */}
      <div className="flex justify-between items-center px-4 sticky top-16 z-10 bg-white py-4 shadow-sm">
        {/* Sort Dropdown */}
        <div className="w-full flex flex-row items-center gap-2 justify-end">
          <div className="flex flex-row gap-3 items-center">
            <p className="text-sm text-muted-foreground hidden sm:block">
              Sort:
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Sort products"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  disabled={isPending}
                >
                  {sortOptions.find((option) => option.value === sort)?.label ||
                    'Latest'}
                  <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
                          { scroll: false }
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
          <Sheet>
            <SheetTrigger asChild>
              <Button
                aria-label="Filter products"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isPending}
              >
                <AiOutlineFilter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader className="px-1">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <Separator />

              {/* Search */}
              <div className="my-4">
                <h3 className="text-sm font-medium mb-2">Search</h3>
                <Input
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  placeholder="What are you looking for?"
                />
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium tracking-wide">
                  Price range (đ)
                </h3>
                <Slider
                  variant="range"
                  thickness="thin"
                  defaultValue={[0, 10000000]}
                  max={10000000}
                  step={10000}
                  value={[
                    priceRange[0],
                    priceRange[1] !== null ? priceRange[1] : 10000000,
                  ]}
                  onValueChange={(value: [number, number]) => {
                    // If the slider is at max value, set to null (no upper limit)
                    const maxPrice = value[1] >= 10000000 ? null : value[1];
                    setPriceRange([value[0], maxPrice]);
                  }}
                />
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={priceRange[1] !== null ? priceRange[1] : 10000000}
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
                    max={10000000}
                    className="h-9"
                    value={priceRange[1] !== null ? priceRange[1] : ''}
                    placeholder="Max"
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const value =
                        inputValue === '' ? null : Number(inputValue);
                      setPriceRange([priceRange[0], value]);
                    }}
                  />
                </div>
              </div>

              {/* Categories */}
              <ScrollArea className="my-2 flex-1 pr-4">
                <div className="space-y-4">
                  <Accordion
                    type="multiple"
                    defaultValue={['categories']}
                    className="w-full"
                  >
                    <AccordionItem value="categories">
                      <AccordionTrigger className="text-sm">
                        Categories
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2">
                          {isLoadingCategories ? (
                            <Spinner size="sm" />
                          ) : (
                            categoriesData?.map((category) => (
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

              {/* Actions */}
              <div>
                <Separator className="my-4" />
                <SheetFooter>
                  <Button
                    aria-label="Clear filters"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Products Display */}
      {isLoading ? (
        <div className="w-full py-20 flex items-center justify-center">
          <Loader />
        </div>
      ) : !hasProducts ? (
        <div className="mx-auto flex max-w-xs flex-col space-y-1.5 py-20">
          <h1 className="text-center text-2xl font-bold">No products found</h1>
          <p className="text-center text-muted-foreground">
            Try changing your filters, or check back later for new products
          </p>
          <Button className="mt-4" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          {/* Product Count */}
          <div className="px-4">
            <p className="text-sm text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Products Grid */}
          <div className="px-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                total={totalPages}
                initialPage={currentPage}
                page={currentPage}
                onChange={handlePageChange}
                showControls
                variant="flat"
                classNames={{
                  cursor: 'bg-black text-white',
                }}
              />
            </div>
          )}
        </>
      )}

      <Footer />
    </section>
  );
}
