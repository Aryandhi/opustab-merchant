export const environments = {
  production: 'https://merchant.opustab.com',
  dev: 'https://merchant.dev.opustab.com',
  new: 'https://merchant.new.opustab.com',
  demo: 'https://merchant.demo.opustab.com' 
};

export type Environment = keyof typeof environments;