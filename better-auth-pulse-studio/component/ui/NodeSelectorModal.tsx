import { ALL_NODE_TYPES, CATEGORY_DOT_COLORS } from "../types/nodeTypes";

interface NodeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeType: string) => void;
}

export function NodeSelectorModal({
  isOpen,
  onClose,
  onSelectNode,
}: NodeSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add New Node</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ALL_NODE_TYPES.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => onSelectNode(nodeType.type)}
              className="p-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-left transition-colors group"
            >
              <div className="flex items-start space-x-3">
                <div
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{
                    backgroundColor:
                      CATEGORY_DOT_COLORS[
                        nodeType.category as keyof typeof CATEGORY_DOT_COLORS
                      ] || CATEGORY_DOT_COLORS.default,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white group-hover:text-gray-100 transition-colors">
                    {nodeType.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {nodeType.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
