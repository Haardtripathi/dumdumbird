-- flappy-bird-contract.lua
local json = require("json")

-- Initialize the game state
local gameState = {
    highScores = {}
  }
  
  -- Handler for initializing the game
  function Initialize()
    if not ao.id then
      ao.id = ao.send({ Target = ao.id, Action = "Identity" })
    end
    return "Game initialized"
  end
  
  -- Handler for saving a new score
  function SaveScore(msg)
    assert(type(msg.Score) == "number", "Score must be a number")
    
    table.insert(gameState.highScores, {
      player = msg.From,
      score = msg.Score
    })
    
    -- Sort high scores in descending order
    table.sort(gameState.highScores, function(a, b) return a.score > b.score end)
    
    -- Keep only top 10 scores
    while #gameState.highScores > 10 do
      table.remove(gameState.highScores)
    end
    
    return "Score saved successfully"
  end
  
  -- Handler for retrieving high scores
  function GetHighScores()
    return json.encode(gameState.highScores)
end
  
  -- Main message handler
  function Handle(msg)
    if msg.Action == "Initialize" then
      return Initialize()
    elseif msg.Action == "SaveScore" then
      return SaveScore(msg)
    elseif msg.Action == "GetHighScores" then
      return GetHighScores()
    else
      return "Invalid action"
    end
  end
  
  return {
    handle = Handle
}