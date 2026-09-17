import bcrypt from 'bcrypt';

const run = async () => {
  const hash = await bcrypt.hash('123456', 10);
  console.log('HASH THẬT:', hash);
};

run();