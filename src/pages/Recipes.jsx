import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import iconServings from "../assets/icons/icon-servings.svg";
import iconPrepTime from "../assets/icons/icon-prep-time.svg";
import iconCookTime from "../assets/icons/icon-cook-time.svg";
import iconSearch from "../assets/icons/icon-search.svg";

const API_URL = import.meta.env.VITE_API_URL;
const SEARCH_DEBOUNCE_MS = 500;

const PREP_TIME_OPTIONS = [
  { label: "Max Prep Time", value: "" },
  { label: "Up to 5 min", value: "5" },
  { label: "Up to 10 min", value: "15" },
  { label: "Up to 15 min", value: "20" },
  { label: "Up to 30 min", value: "30" },
  { label: "Up to 60 min", value: "60" },
];

const COOK_TIME_OPTIONS = [
  { label: "Max Cook Time", value: "" },
  { label: "Up to 10 min", value: "10" },
  { label: "Up to 15 min", value: "15" },
  { label: "Up to 20 min", value: "20" },
  { label: "Up to 30 min", value: "30" },
  { label: "Up to 60 min", value: "60" },
];

function buildUrl({ page, maxPrepTime, maxCookTime, search }) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", page);
  if (maxPrepTime) params.set("maxPrepTime", maxPrepTime);
  if (maxCookTime) params.set("maxCookTime", maxCookTime);
  if (search) params.set("search", search);
  const qs = params.toString();
  return `${API_URL}/api/v2/recipes${qs ? `?${qs}` : ""}`;
}

export default function Recipes() {
  const [page, setPage] = useState(1);
  const [maxPrepTime, setMaxPrepTime] = useState("");
  const [maxCookTime, setMaxCookTime] = useState("");
  console.log(API_URL);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef(null);



  // Debounce: only update the actual search query after the user stops typing
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["recipes", { page, maxPrepTime, maxCookTime, search: debouncedSearch }],
    queryFn: () =>
      fetch(buildUrl({ page, maxPrepTime, maxCookTime, search: debouncedSearch })).then((r) =>
        r.json(),
      ),
    retry: 0,
    placeholderData: keepPreviousData,
  });

  const recipes = data?.recipes ?? [];
  const pagination = data?.pagination;

  // Reset to page 1 when filters change
  function handleFilterChange(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <>
      {/* Hero */}
      <section className="container mx-auto max-w-5xl flex flex-col items-center text-center px-6 py-12">
        <h1 className="text-5xl font-extrabold text-teal-950 tracking-tight mb-6">
          Explore our simple, healthy recipes
        </h1>
        <p className="text-lg text-teal-900 leading-relaxed max-w-3xl">
          Discover quick, whole-food dishes that fit real-life schedules and
          taste amazing. Use the filters to narrow your search or simply scroll
          and let something delicious catch your eye.
        </p>
      </section>

      {/* Filters */}
      <section className="container mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={maxPrepTime}
            onChange={(e) => handleFilterChange(setMaxPrepTime)(e.target.value)}
            className="border border-gray-300 rounded-full px-4 py-2.5 text-sm text-teal-900 font-medium cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          >
            {PREP_TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={maxCookTime}
            onChange={(e) => handleFilterChange(setMaxCookTime)(e.target.value)}
            className="border border-gray-300 rounded-full px-4 py-2.5 text-sm text-teal-900 font-medium cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          >
            {COOK_TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="ml-auto relative w-72">
            <img src={iconSearch} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or ingredient..."
              className="w-full border border-gray-300 rounded-full pl-10 pr-5 py-2.5 text-sm text-teal-900 placeholder:text-teal-900/40 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>
        </div>
      </section>

      {/* Loading */}
      {isPending && (
        <p className="container mx-auto max-w-5xl px-6 py-24 text-center text-teal-900 font-medium">
          Loading recipes...
        </p>
      )}

      {/* Error */}
      {isError && (
        <p className="container mx-auto max-w-5xl px-6 py-24 text-center text-red-600 font-medium">
          Error loading recipes: {error.message}
        </p>
      )}

      {/* Empty state */}
      {!isPending && !isError && recipes.length === 0 && (
        <p className="container mx-auto max-w-5xl px-6 py-24 text-center text-teal-900 font-medium">
          No recipes found.
        </p>
      )}

      {/* Recipe Grid */}
      {!isPending && !isError && recipes.length > 0 && (
        <section
          className={`container mx-auto max-w-5xl px-6 py-12 transition-opacity duration-200 ${isFetching ? "opacity-60" : ""}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <article
                key={recipe.slug}
                className="bg-white rounded-2xl border border-gray-200 flex flex-col shadow group p-2"
              >
                <div className="aspect-square overflow-hidden rounded-xl mb-2">
                  <img
                    src={
                      recipe.cover || "https://placehold.co/600x600?text=No+Image"
                    }
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col flex-1 px-1">
                  <h2 className="text-xl font-bold text-teal-950 mb-2">
                    {recipe.title}
                  </h2>
                  <p className="text-sm text-teal-900/70 line-clamp-2 mb-4">
                    {recipe.summary}
                  </p>

                  <div className="mt-auto space-y-4">
                    <div className="grid grid-cols-2 gap-y-2 text-xs font-medium text-teal-900/80">
                      <span className="flex items-center gap-1.5">
                        <img src={iconServings} alt="" className="w-4 h-4" />
                        Servings: {recipe.servings || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <img src={iconPrepTime} alt="" className="w-4 h-4" />
                        Prep: {recipe.prepMinutes || 0} mins
                      </span>
                      <span className="flex items-center gap-1.5">
                        <img src={iconCookTime} alt="" className="w-4 h-4" />
                        Cook: {recipe.cookMinutes || 0} min
                      </span>
                    </div>

                    <Link
                      to={`/recipes/${recipe.slug}`}
                      className="block w-full bg-[#163A34] text-white py-3 rounded-full font-bold hover:bg-[#122e2a] transition-colors text-center"
                    >
                      View Recipe
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-3 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-200 bg-white text-teal-900 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-sm font-medium text-teal-900/70">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page >= pagination.totalPages}
                className="px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-200 bg-white text-teal-900 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          )}
        </section>
      )}
    </>
  );
}
