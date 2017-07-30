describe("InterpreterMethodFactory().terminalEmptyString(interpretation)",
function() {
  
  it("calls this.terminal with /(?:)/ and interpretation and returns the " +
  "result", function() {
    var methodFactory = InterpreterMethodFactory();
    spyOn(methodFactory, "terminal").and.returnValue("result");
    expect(methodFactory.terminalEmptyString("interpretation"))
    .toEqual("result");
    expect(methodFactory.terminal)
    .toHaveBeenCalledWith(/(?:)/, "interpretation");
  });
  
});
