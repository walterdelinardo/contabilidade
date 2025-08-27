// src/components/ui/card.jsx
import React from 'react';

const Card = ({ children, ...props }) => {
  return (
    <div {...props} className="p-4 border rounded-md shadow-sm">
      {children}
    </div>
  );
};

const CardHeader = ({ children, ...props }) => {
  return (
    <div {...props} className="font-bold mb-2">
      {children}
    </div>
  );
};

const CardTitle = ({ children, ...props }) => {
  return (
    <h3 {...props} className="text-lg">
      {children}
    </h3>
  );
};

const CardDescription = ({ children, ...props }) => {
  return (
    <p {...props} className="text-sm text-gray-500">
      {children}
    </p>
  );
};

const CardContent = ({ children, ...props }) => {
  return (
    <div {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, ...props }) => {
  return (
    <div {...props} className="mt-4">
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };