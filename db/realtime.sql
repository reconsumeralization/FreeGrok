-- Enable realtime for messages table
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime
ADD TABLE messages;

-- Enable realtime for conversations table
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime
ADD TABLE conversations;

-- Enable realtime for conversation_participants table
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime
ADD TABLE conversation_participants;

-- Enable realtime for users table (limited to name and image fields)
ALTER TABLE users REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime
ADD TABLE users;
