import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Filter, X, ChefHat, AlertCircle, ShoppingCart, Heart, Loader } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  fetchSettings, 
  addFavorite, 
  removeFavorite, 
  fetchFavorites, 
  checkAuth 
} from '../utils/api';

export default function Categories() {
  const router = useRouter();
  
  // États de base
  const [settings, setSettings] = useState({
    site_name: "Le Gourmet Parisien",
    show_prices: "1",
    show_allergens: "1"
  });
  
  const [categories, setCategories] = useState([]);
  const [allDishes, setAllDishes] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États favoris
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [togglingFavorite, setTogglingFavorite] = useState(null);

  const categoryIcons = {
    'Entrées': '🥗',
    'Plats': '🍖',
    'Desserts': '🍰',
    'Boissons': '🍷',
    'Poissons': '🐟',
    'Viandes': '🥩'
  };

  // ============================================
  // CHARGEMENT INITIAL
  // ============================================
  useEffect(() => {
    loadInitialData();
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  useEffect(() => {
    filterDishes();
  }, [selectedCategory, searchTerm, allDishes]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Charger settings et auth
      const [settingsData, authData] = await Promise.all([
        fetchSettings(),
        checkAuth()
      ]);
      
      setSettings(settingsData);
      setIsAuthenticated(authData.authenticated);
      
      // Charger catégories et plats depuis Supabase
      await loadCategoriesAndDishes();
      
      // Si authentifié, charger favoris
      if (authData.authenticated) {
        await loadFavorites();
      }
    } catch (error) {
      console.error('❌ Erreur chargement initial:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CHARGER CATÉGORIES ET PLATS DEPUIS SUPABASE
  // ============================================
  const loadCategoriesAndDishes = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Récupérer les catégories
      const categoriesRes = await fetch(`${API_URL}/categories`, {
        credentials: 'include'
      });
      const categoriesData = await categoriesRes.json();
      
      // Récupérer tous les plats
      const dishesRes = await fetch(`${API_URL}/dishes`, {
        credentials: 'include'
      });
      const dishesData = await dishesRes.json();
      
      setCategories(categoriesData.categories || []);
      setAllDishes(dishesData.dishes || []);
      setDishes(dishesData.dishes || []);
      
      console.log('✅ Chargé:', categoriesData.categories?.length, 'catégories et', dishesData.dishes?.length, 'plats');
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    }
  };

  // ============================================
  // GESTION DES FAVORIS
  // ============================================
  
  const loadFavorites = async () => {
  try {
    const data = await fetchFavorites();
    
    // ✅ CORRECTION: data contient { success: true, favorites: [...], count: X }
    const favoritesArray = data.favorites || [];
    const favoriteIds = favoritesArray.map(fav => fav.id_dish);
    
    setFavorites(favoriteIds);
    console.log('✅ Favoris chargés:', favoriteIds.length);
  } catch (error) {
    console.error('❌ Erreur chargement favoris:', error);
  }
};


  const isFavorite = (dishId) => {
    return favorites.includes(dishId);
  };

  const handleToggleFavorite = async (e, dishId) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      if (confirm('Vous devez être connecté pour ajouter des favoris. Se connecter maintenant ?')) {
        router.push('/login?redirect=/categories');
      }
      return;
    }

    try {
      setTogglingFavorite(dishId);
      
      if (isFavorite(dishId)) {
        await removeFavorite(dishId);
        setFavorites(prev => prev.filter(id => id !== dishId));
      } else {
        await addFavorite(dishId);
        setFavorites(prev => [...prev, dishId]);
      }
    } catch (error) {
      console.error('❌ Erreur toggle favori:', error);
      alert('Impossible de modifier les favoris');
    } finally {
      setTogglingFavorite(null);
    }
  };

  // ============================================
  // FILTRAGE DES PLATS
  // ============================================
  const filterDishes = () => {
    let filtered = [...allDishes];

    if (selectedCategory) {
      filtered = filtered.filter(dish => dish.category_id === selectedCategory);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(search) ||
        dish.description?.toLowerCase().includes(search)
      );
    }

    setDishes(filtered);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleOrder = (dish) => {
    alert(`Commander: ${dish.name} - ${parseFloat(dish.price).toFixed(2)}€\n\nRéservez une table pour profiter de ce plat !`);
  };

  const selectedCat = categories.find(c => c.id_category === selectedCategory);

  // ============================================
  // AFFICHAGE LOADING
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header settings={settings} />

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-pink-600">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className={`relative z-10 text-center px-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-4">
            <ChefHat className="w-16 h-16 text-white mx-auto drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">
            Notre Carte
          </h1>
          <p className="text-xl text-white/95 max-w-2xl mx-auto">
            Découvrez notre sélection de plats raffinés préparés avec passion
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Barre de recherche et filtres */}
        <div className="mb-12 space-y-6">
          {/* Recherche */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un plat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-full text-lg focus:outline-none focus:border-red-500 transition-all shadow-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filtres catégories */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                !selectedCategory 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
            >
              <Filter className="w-4 h-4" />
              Tout voir
            </button>
            {categories.map((category) => (
              <button
                key={category.id_category}
                onClick={() => handleCategoryClick(category.id_category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  selectedCategory === category.id_category
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                <span className="text-lg">{category.icon || categoryIcons[category.name] || '🍴'}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* En-tête section */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-gray-800">
            {selectedCat 
              ? `${selectedCat.icon || categoryIcons[selectedCat.name] || '🍴'} ${selectedCat.name}` 
              : '🌟 Tous nos plats'}
          </h2>
          <div className="text-gray-600 font-semibold">
            {dishes.length} plat{dishes.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Grille de plats */}
        {dishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dishes.map((dish, index) => {
              const isFav = isFavorite(dish.id_dish);
              const isToggling = togglingFavorite === dish.id_dish;

              return (
                <div
                  key={dish.id_dish}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  style={{
                    animation: `fadeInUp 0.6s ease-out forwards`,
                    animationDelay: `${index * 50}ms`,
                    opacity: 0,
                    animationFillMode: 'forwards'
                  }}
                >
                  <div className="relative h-56 overflow-hidden">
                    {dish.image_url ? (
                      <img
                        src={dish.image_url}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white text-6xl">
                        🍽️
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Bouton Favori */}
                    {isAuthenticated && (
                      <button
                        onClick={(e) => handleToggleFavorite(e, dish.id_dish)}
                        disabled={isToggling}
                        className={`favorite-btn ${isFav ? 'active' : ''} ${isToggling ? 'toggling' : ''}`}
                        title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        {isToggling ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Heart 
                            className="heart-icon"
                            fill={isFav ? 'currentColor' : 'none'}
                            size={22}
                          />
                        )}
                      </button>
                    )}

                    {dish.allergens && settings.show_allergens === '1' && (
                      <div className="absolute top-3 left-3 p-2 bg-yellow-400/90 backdrop-blur-sm rounded-full">
                        <AlertCircle className="w-5 h-5 text-yellow-900" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold">
                        {dish.category_name || 'Plat'}
                      </span>
                      {dish.is_vegetarian && (
                        <span className="text-green-600 text-xs font-semibold">🌱 Végétarien</span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                      {dish.name}
                    </h3>

                    {dish.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {dish.description}
                      </p>
                    )}

                    {dish.allergens && settings.show_allergens === '1' && (
                      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800 flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" />
                          Allergènes: {dish.allergens}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {settings.show_prices === '1' && (
                        <div className="text-3xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                          {parseFloat(dish.price).toFixed(2)}€
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleOrder(dish)}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Commander
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4 opacity-30">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucun plat trouvé</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Essayez une autre recherche' : 'Cette catégorie ne contient pas de plats'}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                }}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      <Footer settings={settings} />

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .favorite-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: none;
          color: #DC2626;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .favorite-btn:hover:not(:disabled) {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);
        }

        .favorite-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .favorite-btn.active {
          color: #DC2626;
          background: rgba(252, 165, 165, 0.2);
        }

        .favorite-btn.toggling {
          animation: pulse 0.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .heart-icon {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .favorite-btn:hover:not(:disabled) .heart-icon {
          transform: scale(1.2);
        }

        .favorite-btn.active .heart-icon {
          animation: heartbeat 0.6s ease-in-out;
        }

        @keyframes heartbeat {
          0% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.3);
          }
          50% {
            transform: scale(1.1);
          }
          75% {
            transform: scale(1.25);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}