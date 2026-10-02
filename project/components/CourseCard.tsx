import React from 'react';
import type { Course } from '../types';
import { StarIcon } from './icons';

export const CourseCard: React.FC<{ course: Course; onSelect: () => void; }> = ({ course, onSelect }) => {
  return (
    <button onClick={onSelect} className="w-full text-left bg-surface rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col border border-gray-200 hover:border-primary">
      <img src={course.imageUrl} alt={course.title} className="w-full h-40 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-primary tracking-wide">{course.category}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${course.cost === 'Gratis' ? 'bg-green-100 text-green-800' : 'bg-highlight/20 text-yellow-800'}`}>{course.cost}</span>
        </div>
        <h3 className="font-bold font-serif text-lg text-text-primary mt-2 group-hover:text-primary transition-colors flex-grow">{course.title}</h3>
        <div className="flex items-center mt-4 text-sm text-text-secondary">
            <span className={`px-2 py-1 text-xs rounded ${course.level === 'Básico' ? 'bg-secondary/10 text-secondary' : course.level === 'Intermedio' ? 'bg-accent/20 text-green-800' : 'bg-primary/10 text-primary'}`}>{course.level}</span>
            <span className="mx-2">|</span>
            <span>{course.format}</span>
        </div>
        <div className="flex items-center mt-4 text-sm">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(course.rating) ? 'text-highlight' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="ml-2 text-text-secondary">({course.reviewCount} reseñas)</span>
        </div>
      </div>
    </button>
  );
};

export default CourseCard;
