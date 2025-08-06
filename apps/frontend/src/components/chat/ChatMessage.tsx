import { useState } from 'react';
import { Edit2, Trash2, Check, X, MoreVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ChatMessage as ChatMessageType, MessageStatus } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onStatusUpdate?: (messageId: string, status: MessageStatus) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwn,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <div className="flex"><Check className="w-3 h-3 text-gray-400" /><Check className="w-3 h-3 text-gray-400 -ml-1" /></div>;
      case 'read':
        return <div className="flex"><Check className="w-3 h-3 text-blue-500" /><Check className="w-3 h-3 text-blue-500 -ml-1" /></div>;
      default:
        return null;
    }
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const canEdit = isOwn && !message.isEdited;
  const canDelete = isOwn;

  const messageClasses = `
    max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group
    ${isOwn 
      ? 'bg-blue-500 text-white ml-auto' 
      : 'bg-gray-200 text-gray-900 mr-auto'
    }
  `;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="relative">
        {/* Message bubble */}
        <div className={messageClasses}>
          {/* Sender name (for received messages) */}
          {!isOwn && (
            <div className="text-xs font-medium text-gray-600 mb-1">
              {message.senderName}
            </div>
          )}

          {/* Message content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded resize-none text-gray-900"
                rows={2}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  }
                  if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs"
                >
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-xs"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm break-words">
              {message.content}
              {message.isEdited && (
                <span className={`text-xs ml-2 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                  (editado)
                </span>
              )}
            </div>
          )}

          {/* Actions button */}
          {(canEdit || canDelete) && !isEditing && (
            <button
              onClick={() => setShowActions(!showActions)}
              className={`
                absolute -top-1 -right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                ${isOwn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 hover:bg-gray-400'}
              `}
            >
              <MoreVertical className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Actions menu */}
        {showActions && (canEdit || canDelete) && (
          <div className={`
            absolute top-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]
            ${isOwn ? 'right-12' : 'left-12'}
          `}>
            {canEdit && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit2 className="w-3 h-3" />
                Editar
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  onDelete?.(message.id);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
                Eliminar
              </button>
            )}
          </div>
        )}

        {/* Message metadata */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTime(message.createdAt)}</span>
          {isOwn && getStatusIcon(message.status)}
        </div>
      </div>

      {/* Click outside to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};
