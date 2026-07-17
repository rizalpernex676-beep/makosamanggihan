import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // base delay in ms
  stagger?: number; // stagger delay in ms for children
  staggerChildren?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  stagger = 100,
  staggerChildren = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before the section comes fully into view
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  if (staggerChildren) {
    const childrenArray = React.Children.toArray(children);
    return (
      <div ref={ref} className={className}>
        {childrenArray.map((child, index) => {
          if (!React.isValidElement(child)) return child;

          // Merge style & classes
          const childStyle: React.CSSProperties = {
            ...child.props.style,
            transition: 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: isVisible ? `${delay + index * stagger}ms` : '0ms',
          };

          return React.cloneElement(child as any, {
            style: childStyle,
            className: `${child.props.className || ''} ${
              isVisible
                ? 'opacity-100 translate-y-0 transition-all duration-700'
                : 'opacity-0 translate-y-6 pointer-events-none transition-all duration-700'
            }`,
          });
        })}
      </div>
    );
  }

  // Single element transition
  const style: React.CSSProperties = {
    transition: 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: isVisible ? `${delay}ms` : '0ms',
  };

  return (
    <div
      ref={ref}
      style={style}
      className={`${className} ${
        isVisible ? 'opacity-100 translate-y-0 transition-all duration-700' : 'opacity-0 translate-y-6 transition-all duration-700'
      }`}
    >
      {children}
    </div>
  );
};
