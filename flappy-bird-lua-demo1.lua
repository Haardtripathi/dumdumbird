local json = require("json")

-- Initialize the game state
-- function initState()
--     if not ao.state then
--         ao.state = {
--             highScores = {},
--             initialized = false
--         }
--     elseif not ao.state.highScores then
--         ao.state.highScores = {}
--         ao.state.initialized = false
--     end
-- end


if not HIGH_SCORES then HIGH_SCORES = {} end
if not INITIALIZED then INITIALIZED = false end

Handlers.add("Initialize",
    Handlers.utils.hasMatchingTag("Action", "Initialize"),
    function(msg)
        if not INITIALIZED then
            INITIALIZED = true

            Send({
                Target = msg.From,
                Data = json.encode({
                    status = "success",
                    message = "Game initialized"
                })
            })

            return
        end

        Send({
            Target = msg.From,
            Data = json.encode({
                status = "success",
                message = "Game already initialized"
            })
        })
    end
)

Handlers.add("SaveScore",
            {Action="SaveScore"},
            function (msg)
                -- initState()
                print("Processing SaveScore request")
                print("Message:", json.encode(msg))
                
                -- printState()
                if not msg.Tags then 
                    return json.encode({
                        status = "error",
                        message = "Invalid message format: no tags found"
                    })
                end
                
                local score = nil
                local wallet = nil
                for _, tag in ipairs(msg.Tags) do
                    if tag.name == "Wallet" then
                        wallet = tag.value
                    end
                end
            
                
                for _, tag in ipairs(msg.Tags) do
                    if tag.name == "Wallet" then
                        wallet = tag.value
                    end
                end
                
                -- if not score then 
                --     return json.encode({
                --         status = "error",
                --         message = "Score not provided or invalid"
                --     })
                -- end
            
                score=tonumber(msg.data)
                
                -- if not wallet then
                --     wallet = msg.From
                -- end
                
                if score < 0 then 
                    return json.encode({
                        status = "error",
                        message = "Invalid score value: must be non-negative"
                    })
                end
                
                -- Add new score
                local newScore = {
                    player = wallet,
                    score = score,
                    timestamp = os.time()
                }
            
                -- msg.remove(newScore)
                
                table.insert(highScores, newScore)
                print(highScores)
                for k,v in highScores do
                    print(k,v)
                end
                -- Sort scores in descending order
                table.sort(highScores, function(a, b) 
                    return a.score > b.score 
                end)
            
                msg.reply({table})
                
                
                return json.encode({ 
                    status = "success",
                    message = "Score saved successfully",
                    data = newScore
                })
            end
)


-- -- function SaveScore(msg)
-- --     -- initState()
-- --     print("Processing SaveScore request")
-- --     print("Message:", json.encode(msg))
    
-- --     -- printState()
-- --     if not msg.Tags then 
-- --         return json.encode({
-- --             status = "error",
-- --             message = "Invalid message format: no tags found"
-- --         })
-- --     end
    
-- --     local score = nil
-- --     local wallet = nil
-- --     for _, tag in ipairs(msg.Tags) do
-- --         if tag.name == "Wallet" then
-- --             wallet = tag.value
-- --         end
-- --     end

    
-- --     for _, tag in ipairs(msg.Tags) do
-- --         if tag.name == "Wallet" then
-- --             wallet = tag.value
-- --         end
-- --     end
    
-- --     -- if not score then 
-- --     --     return json.encode({
-- --     --         status = "error",
-- --     --         message = "Score not provided or invalid"
-- --     --     })
-- --     -- end

-- --     score=tonumber(msg.data)
    
-- --     -- if not wallet then
-- --     --     wallet = msg.From
-- --     -- end
    
-- --     if score < 0 then 
-- --         return json.encode({
-- --             status = "error",
-- --             message = "Invalid score value: must be non-negative"
-- --         })
-- --     end
    
-- --     -- Add new score
-- --     local newScore = {
-- --         player = wallet,
-- --         score = score,
-- --         timestamp = os.time()
-- --     }

-- --     -- msg.remove(newScore)
    
-- --     table.insert(highScores, newScore)
-- --     print(highScores)
-- --     for k,v in highScores do
-- --         print(k,v)
-- --     end
-- --     -- Sort scores in descending order
-- --     table.sort(highScores, function(a, b) 
-- --         return a.score > b.score 
-- --     end)

-- --     msg.reply({table})
    
    
-- --     return json.encode({ 
-- --         status = "success",
-- --         message = "Score saved successfully",
-- --         data = newScore
-- --     })
-- -- end

-- -- Handler for retrieving all scores
-- function GetAllScores()
--     -- initState()  -- Ensure the state is initialized
--     -- printState() -- Print current state for debugging

--     -- Check if there are any high scores
--     if #highScores == 0 then
--         return json.encode({
--             status = "success",
--             message = "No scores available",
--             data = {}
--         })
--     end

--     -- If scores are available, return them
--     return json.encode({
--         status = "success",
--         message = "Scores retrieved successfully",
--         data = highScores
--     })
-- end

-- Main message handler
-- Main message handler
-- Handlers.handle = function(msg)
--     -- initState()
--     print("Received message:", json.encode(msg))

--     local action = nil
--     if msg.Tags then
--         for _, tag in ipairs(msg.Tags) do
--             if tag.name == "Action" then
--                 action = tag.value
--                 break
--             end
--         end
--     end

--     if not action then
--         return json.encode({
--             status = "error",
--             message = "No action specified in message tags"
--         })
--     end

--     print("Processing action:", action)

--     local handlers = {
--         ["Initialize"] = Initialize,
--         ["SaveScore"] = SaveScore,
--         ["GetAllScores"] = GetAllScores
--     }

--     local handler = handlers[action]
--     if not handler then
--         return json.encode({
--             status = "error",
--             message = "Invalid action: " .. tostring(action)
--         })
--     end

--     -- Execute the handler without pcall, handling errors directly
--     local result
--     local success, errorMessage

--     -- Attempt to execute the handler and capture any errors
--     success, result = xpcall(handler, function(err) return err end, msg)

--     if not success then
--         errorMessage = result or "Unknown error occurred"
--         return json.encode({
--             status = "error",
--             message = "Error executing action: " .. tostring(errorMessage)
--         })
--     end

--     return result
-- end

-- Initialize state when contract is loaded
-- initState()
-- printState()

return Handlers

-- local json = require("json")

-- Handlers = {}

-- -- Initialize the game state
-- function initState()
--     if not ao.state then
--         ao.state = {
--             highScores = {},
--             initialized = false
--         }
--     elseif not ao.state.highScores then
--         ao.state.highScores = {}
--         ao.state.initialized = false
--     end
-- end

-- -- Helper function to print state for debugging
-- function printState()
--     print("Current state:")
--     print(json.encode(ao.state))
-- end

-- -- Handler for initializing the game
-- Handlers.Initialize = function()
--     initState()
--     if not ao.state.initialized then
--         ao.state.initialized = true
--         printState()
--         return json.encode({
--             status = "success",
--             message = "Game initialized"
--         })
--     end
--     return json.encode({
--         status = "success",
--         message = "Game already initialized"
--     })
-- end

-- -- Handler for saving a new score
-- Handlers.SaveScore = function(msg)
--     initState()
--     print("Processing SaveScore request")
--     print("Message:", json.encode(msg))
    
--     printState()
--     if not msg.Tags then 
--         return json.encode({
--             status = "error",
--             message = "Invalid message format: no tags found"
--         })
--     end
    
--     local wallet = msg.From
--     for _, tag in ipairs(msg.Tags) do
--         if tag.name == "Wallet" then
--             wallet = tag.value
--             break
--         end
--     end
    
--     local score = tonumber(msg.data)
    
--     if not score then 
--         return json.encode({
--             status = "error",
--             message = "Score not provided or invalid"
--         })
--     end
    
--     if score < 0 then 
--         return json.encode({
--             status = "error",
--             message = "Invalid score value: must be non-negative"
--         })
--     end
    
--     -- Add new score
--     local newScore = {
--         player = wallet,
--         score = score,
--         timestamp = os.time()
--     }
    
--     -- Ensure highScores is initialized before inserting
--     if type(ao.state.highScores) ~= "table" then
--         ao.state.highScores = {}
--     end
    
--     table.insert(ao.state.highScores, newScore)
    
--     -- Sort scores in descending order
--     table.sort(ao.state.highScores, function(a, b) 
--         return a.score > b.score 
--     end)
    
--     printState()
    
--     return json.encode({ 
--         status = "success",
--         message = "Score saved successfully",
--         data = newScore
--     })
-- end

-- -- Handler for retrieving all scores
-- Handlers.GetAllScores = function()
--     initState()  -- Ensure the state is initialized
--     printState() -- Print current state for debugging

--     -- Check if there are any high scores
--     if #ao.state.highScores == 0 then
--         return json.encode({
--             status = "success",
--             message = "No scores available",
--             data = {}
--         })
--     end

--     -- If scores are available, return them
--     return json.encode({
--         status = "success",
--         message = "Scores retrieved successfully",
--         data = ao.state.highScores
--     })
-- end

-- -- Main message handler
-- Handlers.handle = function(msg)
--     initState()
--     print("Received message:", json.encode(msg))

--     local action = nil
--     if msg.Tags then
--         for _, tag in ipairs(msg.Tags) do
--             if tag.name == "Action" then
--                 action = tag.value
--                 break
--             end
--         end
--     end

--     if not action then
--         return json.encode({
--             status = "error",
--             message = "No action specified in message tags"
--         })
--     end

--     print("Processing action:", action)

--     local handler = Handlers[action]
--     if not handler then
--         return json.encode({
--             status = "error",
--             message = "Invalid action: " .. tostring(action)
--         })
--     end

--     -- Execute the handler and capture any errors
--     local success, result = pcall(handler, msg)

--     if not success then
--         return json.encode({
--             status = "error",
--             message = "Error executing action: " .. tostring(result)
--         })
--     end

--     return result
-- end

-- -- Initialize state when contract is loaded
-- initState()
-- printState()

-- return Handlers