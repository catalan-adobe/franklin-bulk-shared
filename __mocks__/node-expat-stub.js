// Stub for node-expat: native module can't be rebuilt for Node 24 in this env
class Parser {
  on() { return this; }
  end() {}
  stop() {}
  reset() {}
}

export default { Parser };
export { Parser };
