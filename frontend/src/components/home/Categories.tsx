import React from 'react';
import { Gem, Zap, Cpu, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'sculptures',
    name: 'Sculptures',
    icon: Gem,
    description: 'Artistic 3D printed sculptures and art pieces',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'prototypes',
    name: 'Prototypes',
    icon: Zap,
    description: 'Quick and affordable product prototyping',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'tech',
    name: 'Tech Parts',
    icon: Cpu,
    description: 'Precision engineered technical components',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'custom',
    name: 'Custom Items',
    icon: Palette,
    description: 'Fully customizable bespoke creations',
    color: 'from-green-500 to-emerald-500',
  },
];

const Categories = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore our wide range of 3D printing services and products
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group relative overflow-hidden rounded-2xl h-72 cursor-pointer"
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>

                {/* Content */}
                <div className="relative h-full bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex flex-col justify-between group-hover:from-transparent group-hover:to-transparent transition-colors duration-300">
                  <div>
                    <div className="inline-block p-3 bg-slate-200 rounded-lg group-hover:bg-white/20 transition-colors mb-6">
                      <Icon className="w-8 h-8 text-slate-900 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white transition-colors">
                      {category.name}
                    </h3>
                  </div>

                  <div>
                    <p className="text-slate-600 group-hover:text-white transition-colors mb-4">
                      {category.description}
                    </p>
                    <div className="inline-flex items-center gap-2 text-blue-600 group-hover:text-white transition-colors font-semibold">
                      Explore
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Hover accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
