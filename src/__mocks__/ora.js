const mockSpinner = {
  start: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail: jest.fn().mockReturnThis(),
  warn: jest.fn().mockReturnThis(),
  info: jest.fn().mockReturnThis(),
  text: ''
};

const ora = jest.fn(() => mockSpinner);

module.exports = {
  __esModule: true,
  default: ora
};