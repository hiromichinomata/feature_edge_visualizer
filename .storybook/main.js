/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [],
  features: {
    sidebarOnboardingChecklist: false,
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
