// src/services/codeExamples.js

export const codeExamples = {
  javascript: [
    {
      name: "React Counter Component",
      description: "A simple React counter component with state management",
      code: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(count - 1);
  };

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

export default Counter;`
    },
    {
      name: "Array Map Function",
      description: "Using map to transform an array of data",
      code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];

const userList = users.map(user => (
  <div key={user.id}>
    <span>{user.name}</span>
  </div>
));`
    },
    {
      name: "Async/Await Example",
      description: "Handling asynchronous operations with async/await",
      code: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

// Using the function
fetchUserData(123)
  .then(user => console.log(user))
  .catch(error => console.error(error));`
    }
  ],
  python: [
    {
      name: "Fibonacci Sequence",
      description: "Generate Fibonacci sequence using recursion and memoization",
      code: `def fibonacci(n, memo={}):
    """
    Calculate the nth Fibonacci number using memoization
    """
    if n in memo:
        return memo[n]
    if n <= 2:
        return 1
    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)
    return memo[n]

# Generate first 10 Fibonacci numbers
fib_sequence = [fibonacci(i) for i in range(1, 11)]
print(fib_sequence)`
    },
    {
      name: "File Handling",
      description: "Reading and writing files with error handling",
      code: `def read_file(filename):
    try:
        with open(filename, 'r') as file:
            content = file.read()
            return content
    except FileNotFoundError:
        print(f"Error: File {filename} not found")
        return None
    except IOError as e:
        print(f"Error reading file: {e}")
        return None

def write_file(filename, content):
    try:
        with open(filename, 'w') as file:
            file.write(content)
        print(f"Successfully wrote to {filename}")
    except IOError as e:
        print(f"Error writing file: {e}")

# Usage
content = read_file('example.txt')
if content:
    write_file('output.txt', content.upper())`
    },
    {
      name: "Class and Inheritance",
      description: "Object-oriented programming with inheritance",
      code: `class Animal:
    def __init__(self, name, species):
        self.name = name
        self.species = species
    
    def speak(self):
        raise NotImplementedError("Subclass must implement this method")
    
    def move(self):
        print(f"{self.name} is moving")

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name, "Canine")
        self.breed = breed
    
    def speak(self):
        print("Woof!")
    
    def fetch(self):
        print(f"{self.name} is fetching the ball")

# Create instances
my_dog = Dog("Buddy", "Golden Retriever")
my_dog.speak()
my_dog.move()
my_dog.fetch()`
    }
  ],
  java: [
    {
      name: "Hello World Program",
      description: "Basic Java program structure",
      code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Print command line arguments
        for (int i = 0; i < args.length; i++) {
            System.out.println("Argument " + i + ": " + args[i]);
        }
    }
}`
    },
    {
      name: "ArrayList Operations",
      description: "Working with ArrayList collections",
      code: `import java.util.ArrayList;
import java.util.Iterator;

public class ArrayListExample {
    public static void main(String[] args) {
        // Create ArrayList
        ArrayList<String> fruits = new ArrayList<>();
        
        // Add elements
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Orange");
        
        // Access elements
        System.out.println("First fruit: " + fruits.get(0));
        
        // Iterate using for-each loop
        for (String fruit : fruits) {
            System.out.println(fruit);
        }
        
        // Remove element
        fruits.remove("Banana");
        System.out.println("Size after removal: " + fruits.size());
    }
}`
    }
  ],
  cpp: [
    {
      name: "Basic Calculator",
      description: "Simple calculator with switch statement",
      code: `#include <iostream>
using namespace std;

int main() {
    char operation;
    double num1, num2;
    
    cout << "Enter operator (+, -, *, /): ";
    cin >> operation;
    
    cout << "Enter two numbers: ";
    cin >> num1 >> num2;
    
    switch(operation) {
        case '+':
            cout << num1 << " + " << num2 << " = " << num1 + num2;
            break;
        case '-':
            cout << num1 << " - " << num2 << " = " << num1 - num2;
            break;
        case '*':
            cout << num1 << " * " << num2 << " = " << num1 * num2;
            break;
        case '/':
            if (num2 != 0)
                cout << num1 << " / " << num2 << " = " << num1 / num2;
            else
                cout << "Error: Division by zero!";
            break;
        default:
            cout << "Error: Invalid operator!";
    }
    
    return 0;
}`
    }
  ],
  html: [
    {
      name: "Basic HTML5 Structure",
      description: "Modern HTML5 document structure",
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        header {
            background-color: #333;
            color: white;
            padding: 1rem;
        }
    </style>
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is the home section content.</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 My Website. All rights reserved.</p>
    </footer>
</body>
</html>`
    }
  ],
  css: [
    {
      name: "Flexbox Layout",
      description: "Modern CSS layout with Flexbox",
      code: `.container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f0f0f0;
}

.header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem;
    text-align: center;
}

.main-content {
    display: flex;
    flex: 1;
    gap: 20px;
    padding: 20px;
}

.sidebar {
    flex: 1;
    background-color: #34495e;
    color: white;
    padding: 1rem;
    border-radius: 8px;
}

.content {
    flex: 3;
    background-color: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.footer {
    background-color: #2c3e50;
    color: white;
    text-align: center;
    padding: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
    .main-content {
        flex-direction: column;
    }
    
    .sidebar, .content {
        flex: none;
    }
}`
    }
  ]
};

export const getLanguages = () => {
  return Object.keys(codeExamples);
};

export const getExamplesByLanguage = (language) => {
  return codeExamples[language] || [];
};

export const getAllExamples = () => {
  return Object.values(codeExamples).flat();
};

export const searchExamples = (query) => {
  const searchTerm = query.toLowerCase();
  return getAllExamples().filter(example => 
    example.name.toLowerCase().includes(searchTerm) ||
    example.description.toLowerCase().includes(searchTerm) ||
    example.code.toLowerCase().includes(searchTerm)
  );
};