// Extracts variables from a template string.
// Variables are expected in the format {{variable_name}}.
export const extractVariables = (templateString: string): string[] => {
  if (!templateString) return [];
  const regex = /\{\{([^{}]+?)\}\}/g;
  const matches = new Set<string>();
  let match;
  while ((match = regex.exec(templateString)) !== null) {
    matches.add(match[1].trim());
  }
  return Array.from(matches);
};

// Replaces variables in a template string with their provided values.
export const fillTemplate = (templateString: string, values: Record<string, string>): string => {
  if (!templateString) return "";
  let result = templateString;
  for (const key in values) {
    // Ensure the key is directly on the object and not from prototype
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, values[key]);
    }
  }
  return result;
};
