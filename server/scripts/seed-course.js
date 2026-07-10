/**
 * Bulk-import a whole course (with topics + subtopics) in one shot instead
 * of clicking "+ Add" dozens of times in the UI.
 *
 * Usage:
 *   node server/scripts/seed-course.js <username>
 *
 * The user must already exist (register once in the app UI first) —
 * this script just attaches a new course to that account.
 */
require("dotenv").config();
const prisma = require("../prisma");

// ---- Edit this array to import any other curriculum the same way ----
const COURSE = {
  title: "React",
  description: "Full React learning path, from basics to deployment.",
  topics: [
    {
      title: "React Basics",
      subtopics: [
        "What is React?",
        "Why React?",
        "Library vs Framework",
        "JSX",
        "Components",
        "Props",
        "Conditional Rendering",
        "Rendering Lists (map())",
        "Keys",
      ],
    },
    {
      title: "React Hooks",
      subtopics: [
        "useState()",
        "State vs Props",
        "Updating State",
        "useEffect()",
        "Dependency Array",
        "Cleanup Function",
        "useRef()",
        "useMemo()",
        "useCallback()",
        "useContext()",
        "Custom Hooks",
      ],
    },
    {
      title: "Events",
      subtopics: [
        "onClick",
        "onChange",
        "onSubmit",
        "onKeyDown",
        "Mouse Events",
        "Keyboard Events",
      ],
    },
    {
      title: "Forms",
      subtopics: [
        "Controlled Components",
        "Uncontrolled Components",
        "Form Validation",
        "Multiple Inputs",
        "Checkbox",
        "Radio Button",
        "Select",
        "Textarea",
      ],
    },
    {
      title: "Styling",
      subtopics: [
        "CSS",
        "Inline CSS",
        "CSS Modules",
        "Dynamic Styles",
        "Tailwind CSS (optional)",
      ],
    },
    {
      title: "Component Communication",
      subtopics: [
        "Parent to Child (Props)",
        "Child to Parent (Callback Functions)",
        "Sibling Communication",
        "Lifting State Up",
      ],
    },
    {
      title: "React Router",
      subtopics: [
        "Installation",
        "BrowserRouter",
        "Routes",
        "Route",
        "Link",
        "NavLink",
        "useNavigate",
        "useParams",
        "Nested Routes",
        "Protected Routes",
      ],
    },
    {
      title: "API Calls",
      subtopics: [
        "Fetch API",
        "Async/Await",
        "Loading State",
        "Error Handling",
        "Display API Data",
      ],
    },
    {
      title: "CRUD Operations",
      subtopics: [
        "Create",
        "Read",
        "Update",
        "Delete",
        "Using Fake API",
        "Using JSON Server",
        "Using Backend API",
      ],
    },
    {
      title: "State Management",
      subtopics: [
        "Context API",
        "Reducer Pattern (useReducer)",
        "External state management libraries (optional at first)",
      ],
    },
    {
      title: "Performance Optimization",
      subtopics: [
        "React.memo",
        "useMemo",
        "useCallback",
        "Lazy Loading",
        "Code Splitting",
      ],
    },
    {
      title: "Advanced React",
      subtopics: [
        "Higher Order Components (HOC)",
        "Render Props",
        "Portals",
        "Error Boundaries",
        "Fragments",
        "Suspense",
      ],
    },
    {
      title: "Project Structure",
      subtopics: [
        "Folder Structure",
        "Reusable Components",
        "Custom Hooks",
        "Assets",
        "Utils",
        "Services",
      ],
    },
    {
      title: "Authentication",
      subtopics: ["Login", "Signup", "JWT", "Protected Routes", "Logout"],
    },
    {
      title: "Deployment",
      subtopics: [
        "Build React App",
        "Environment Variables",
        "Deploy to a hosting service",
      ],
    },
  ],
};

async function main() {
  const username = process.argv[2];
  if (!username) {
    console.error("Usage: node server/scripts/seed-course.js <username>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    console.error(
      `No user found with username "${username}". Register that account in the app first, then re-run this script.`
    );
    process.exit(1);
  }

  const lastCourse = await prisma.course.findFirst({
    where: { userId: user.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const course = await prisma.course.create({
    data: {
      title: COURSE.title,
      description: COURSE.description,
      position: (lastCourse?.position ?? -1) + 1,
      userId: user.id,
      topics: {
        create: COURSE.topics.map((topic, topicIndex) => ({
          title: topic.title,
          position: topicIndex,
          subtopics: {
            create: topic.subtopics.map((title, subIndex) => ({
              title,
              position: subIndex,
            })),
          },
        })),
      },
    },
    include: { topics: { include: { subtopics: true } } },
  });

  const topicCount = course.topics.length;
  const subtopicCount = course.topics.reduce(
    (sum, t) => sum + t.subtopics.length,
    0
  );

  console.log(
    `✔ Created course "${course.title}" for ${username}: ${topicCount} topics, ${subtopicCount} subtopics.`
  );
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
