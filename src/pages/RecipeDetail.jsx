import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import iconServings from "../assets/icons/icon-servings.svg";
import iconPrepTime from "../assets/icons/icon-prep-time.svg";
import iconCookTime from "../assets/icons/icon-cook-time.svg";
import iconBulletPoint from "../assets/icons/icon-bullet-point.svg";

const API_URL = import.meta.env.VITE_API_URL;

export default function RecipeDetail() {
  const { slug } = useParams();
  console.log({ API_URL });

  const {
    data: recipe,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["recipe", slug],
    queryFn: () =>
      fetch(`${API_URL}/api/v1/recipes/${slug}`).then((r) => r.json()),
    retry: 0,
  });

  if (isPending)
    return (
      <p className="container mx-auto max-w-5xl px-6 py-24 text-center text-teal-900 font-medium">
        Loading recipes...
      </p>
    );

  if (isError)
    return (
      <div className="container mx-auto max-w-5xl px-6 py-24 text-center text-teal-900 font-medium">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Error loading recipe
        </h1>
        <p className="mb-6">{error.message}</p>
        <Link to="/recipes" className="text-teal-700 hover:underline">
          Back to all recipes
        </Link>
      </div>
    );

  if (!recipe || recipe.error)
    return (
      <div className="container mx-auto max-w-5xl px-6 py-24 text-center text-teal-900 font-medium">
        <h1 className="text-2xl font-bold text-teal-950 mb-4">
          Recipe not found
        </h1>
        <Link to="/recipes" className="text-teal-700 hover:underline">
          Back to all recipes
        </Link>
      </div>
    );

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-teal-900/60">
        <Link to="/recipes" className="hover:text-teal-900 transition-colors">
          Recipes
        </Link>
        <span className="mx-2">/</span>
        <span className="text-teal-900 font-semibold">{recipe.title}</span>
      </nav>

      {/* Header — image + info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
        <div className="rounded-3xl overflow-hidden aspect-4/3 shadow-lg shadow-teal-900/5">
          <img
            src={
              recipe.cover || "https://placehold.co/800x600?text=No+Image"
            }
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="py-4">
          <h1 className="text-5xl font-bold text-teal-950 mb-6 leading-tight">
            {recipe.title}
          </h1>
          <p className="text-lg text-teal-900/70 mb-8 leading-relaxed">
            {recipe.summary}
          </p>

          <div className="flex flex-wrap gap-6 text-sm font-medium text-teal-900/80">
            <span className="flex items-center gap-2">
              <img src={iconServings} alt="" className="w-5 h-5" />
              Servings: {recipe.servings || 0}
            </span>
            <span className="flex items-center gap-2">
              <img src={iconPrepTime} alt="" className="w-5 h-5" />
              Prep: {recipe.prepMinutes || 0} mins
            </span>
            <span className="flex items-center gap-2">
              <img src={iconCookTime} alt="" className="w-5 h-5" />
              Cook: {recipe.cookMinutes || 0} mins
            </span>
          </div>
        </div>
      </div>

      {/* Ingredients + Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {recipe.ingredients?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-teal-950 mb-6">
              Ingredients:
            </h2>
            <ul className="space-y-4">
              {recipe.ingredients.map((ing) => (
                <li
                  key={ing.id}
                  className="flex gap-3 text-teal-900/80 leading-relaxed items-start"
                >
                  <img
                    src={iconBulletPoint}
                    alt=""
                    className="w-5 h-5 mt-0.5 shrink-0"
                  />
                  <span>
                    {ing.quantity} {ing.unit} {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {recipe.instructions?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-teal-950 mb-6">
              Instructions:
            </h2>
            <ol className="space-y-6">
              {recipe.instructions.map((step) => (
                <li
                  key={step.id}
                  className="flex gap-3 text-teal-900/80 leading-relaxed items-start"
                >
                  <img
                    src={iconBulletPoint}
                    alt=""
                    className="w-5 h-5 mt-0.5 shrink-0"
                  />
                  <span>{step.description}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
