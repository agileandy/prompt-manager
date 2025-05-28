import React, { useState } from 'react';
import Modal from './Modal';
import { Prompt, Folder } from '../types'; // For referencing types in advanced section

type HelpTab = 'guide' | 'advanced';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModalContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HelpTab>('guide');

  const renderUserGuide = () => (
    <div className="space-y-6 text-neutral-700 dark:text-neutral-300">
      <section>
        <h3 className="text-xl font-semibold text-primary-dark dark:text-primary-light mb-2">Welcome to your AI Prompt Manager!</h3>
        <p>This guide helps you get the most out of the app.</p>
      </section>

      <section>
        <h4 className="text-lg font-semibold mb-1">Core Features</h4>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Add Prompts:</strong> Click "Add New Prompt" in the header. Fill in the title, description (optional), the prompt text itself, tags (optional), and assign it to a folder.</li>
          <li><strong>Edit Prompts:</strong> Click the pencil icon on a prompt tile. Editing a prompt saves it as a new version (see "Prompt Versioning" below).</li>
          <li><strong>Delete Prompts:</strong> Click the trash icon on a prompt tile. This deletes the prompt and all its previous versions.</li>
          <li><strong>Manage Folders:</strong> Use the sidebar to create, rename, and delete folders. Folders can be nested. A folder must be empty (no prompts and no subfolders) before it can be deleted.</li>
          <li><strong>Copy to Clipboard:</strong> Click the "Copy Prompt" button on a tile to quickly copy the prompt text. This also updates its "Last Used" date and "Times Used" counter.</li>
        </ul>
      </section>
      
      <section>
        <h4 className="text-lg font-semibold mb-1">Prompt Versioning</h4>
        <p>Never lose a good iteration! When you edit an existing prompt and save it, the app automatically creates a new version.</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>The main grid always displays the latest version of each prompt.</li>
          <li>If a prompt has multiple versions, a "history" icon will appear on its tile. Click this to open the "Version History" modal.</li>
          <li>In the history modal, you can see all previous versions, their creation dates, and their content.</li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold mb-1">Prompt Templating & Variables</h4>
        <p>Make your prompts more reusable with variables. This is useful for prompts that have a similar structure but need slight changes for different contexts.</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Defining Variables:</strong> In the "Prompt Text" field, use double curly braces to define a variable, like <code>&#123;&#123;topic&#125;&#125;</code> or <code>&#123;&#123;user_name&#125;&#125;</code>.</li>
          <li><strong>Using Templates:</strong> If a prompt contains variables, its "Copy Prompt" button will change to "Use Template".
            <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
              <li>Clicking "Use Template" opens a modal where you'll see input fields for each variable you defined.</li>
              <li>Fill in the values for your variables.</li>
              <li>Click "Complete & Use Text". This will create the final prompt string with your values filled in and copy it to your clipboard.</li>
              <li>Using a template also updates the original template prompt's "Last Used" date and "Times Used" counter.</li>
            </ul>
          </li>
          <li><strong>Example:</strong> If your prompt text is <code>Write a short story about a brave knight named &#123;&#123;knight_name&#125;&#125; who must retrieve the &#123;&#123;magical_item&#125;&#125;.</code>, the "Use Template" modal will ask for "knight_name" and "magical_item".</li>
        </ul>
      </section>

       <section>
        <h4 className="text-lg font-semibold mb-1">🤖 AI Text Generation (with Ollama)</h4>
        <p>Leverage your local Ollama instance to generate text directly from your prompts.</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Using the Feature:</strong>
            <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
              <li>Click the "Sparkles" icon (✨) on any prompt tile.</li>
              <li>If the prompt is a template (contains variables like <code>&#123;&#123;variable&#125;&#125;</code>), you'll first be asked to fill in those variables.</li>
              <li>The "AI Generation Modal" will then open, showing the (filled) prompt text.</li>
              <li>Click "Generate Text" to send the prompt to your Ollama instance.</li>
              <li>The AI's response will appear in the "AI Output" area. You can copy this output using the "Copy Output" button.</li>
            </ul>
          </li>
          <li><strong>Important Setup:</strong>
            <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
              <li>This feature requires a running local Ollama instance.</li>
              <li>You <strong className="text-amber-600 dark:text-amber-400">must</strong> configure two environment variables for your application:
                <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
                  <li><code>OLLAMA_API_ENDPOINT</code>: The full URL to your Ollama API's generate endpoint (e.g., <code>http://localhost:11434/api/generate</code>). If using Vite, you might name it <code>VITE_OLLAMA_API_ENDPOINT</code> in your <code>.env</code> file.</li>
                  <li><code>OLLAMA_MODEL_NAME</code>: The name of the Ollama model you want to use (e.g., <code>llama3</code>, <code>mistral</code>). If using Vite, you might name it <code>VITE_OLLAMA_MODEL_NAME</code>.</li>
                </ul>
              </li>
               <li>Ensure these variables are accessible by your frontend JavaScript code (e.g., via <code>process.env.OLLAMA_API_ENDPOINT</code> or <code>import.meta.env.VITE_OLLAMA_API_ENDPOINT</code> if using Vite).</li>
            </ul>
          </li>
          <li><strong>Error Handling:</strong> If the environment variables are not set, Ollama is unreachable, or the model name is invalid, you will receive an error message.</li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold mb-1">Sorting & Filtering</h4>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Sort:</strong> Use the dropdown above the prompt grid to sort by name, most used, recently used, or date created.</li>
          <li><strong>Search:</strong> Use the search bar to find prompts by title, description, or prompt text.</li>
          <li><strong>Filter by Tag:</strong> If you have tags, a tag filter dropdown will appear, allowing you to see only prompts with a specific tag.</li>
          <li><strong>Filter by Folder:</strong> Click on a folder in the sidebar to view only prompts within that folder and its subfolders. "All Prompts" shows everything, and "Uncategorized" shows prompts not in a user-created folder.</li>
        </ul>
      </section>

       <section>
        <h4 className="text-lg font-semibold mb-1">Light/Dark Mode</h4>
        <p>Click the sun/moon icon in the header to toggle between light and dark themes for comfortable viewing.</p>
      </section>

      <section>
        <h4 className="text-lg font-semibold mb-1">Import & Export Data</h4>
        <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Export Data:</strong> Click the "Download" icon in the header to save all your prompts and folders as a JSON file (<code>ai-prompt-manager-backup-YYYY-MM-DD.json</code>) to your computer. This is useful for backups or transferring your data.</li>
            <li><strong>Import Data:</strong> Click the "Upload" icon in the header to select a previously exported JSON backup file.
                <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
                    <li><strong className="text-red-600 dark:text-red-400">CRITICAL WARNING:</strong> Importing data will <strong className="text-red-600 dark:text-red-400">REPLACE ALL</strong> current prompts and folders in the application. This action <strong className="text-red-600 dark:text-red-400">CANNOT BE UNDONE</strong>. You will be asked to confirm before the import proceeds.</li>
                    <li>Ensure the JSON file is a valid backup created by this application.</li>
                </ul>
            </li>
        </ul>
      </section>
    </div>
  );

  const renderAdvancedInfo = () => (
    <div className="space-y-6 text-sm text-neutral-700 dark:text-neutral-300">
      <section>
        <h3 className="text-xl font-semibold text-primary-dark dark:text-primary-light mb-2">Advanced Information & Data Structure</h3>
        <p>This section describes how your data is stored locally in your browser and how the import/export feature works.</p>
      </section>

      <section>
        <h4 className="text-lg font-semibold mb-1">Storage Mechanism</h4>
        <p>Your prompts and folders are stored in your web browser's <strong>IndexedDB</strong>. This is a client-side database, meaning the data resides on your computer within the browser you are using. It is not automatically synced to any cloud service.</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Database Name:</strong> <code>AIPromptManagerDB</code></li>
          <li><strong>Object Stores (Tables):</strong>
            <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
              <li><code>prompts</code>: Stores all versions of all your prompts.</li>
              <li><code>folders</code>: Stores your folder structure.</li>
            </ul>
          </li>
        </ul>
        <p className="mt-2">You can inspect IndexedDB data using your browser's developer tools (usually under the "Application" or "Storage" tab).</p>
      </section>

      <section>
        <h4 className="text-lg font-semibold mb-1">Data Structures (as used in Export/Import)</h4>
        <p>The JSON file used for import/export contains an object with two main arrays: <code>prompts</code> and <code>folders</code>.</p>
        
        <div className="mt-3">
          <h5 className="font-semibold mb-1">Prompt Object:</h5>
          <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded-md text-xs overflow-x-auto">
            {`{
  "id": "string", // Unique ID for this specific version
  "originalPromptId": "string", // ID of the first version
  "version": "number",
  "title": "string",
  "description": "string",
  "promptText": "string",
  "tags": ["string"],
  "folderId": "string | null",
  "createdAt": "string_iso_date",
  "lastUsedAt": "string_iso_date | null",
  "timesUsed": "number"
}`}
          </pre>
        </div>

        <div className="mt-4">
          <h5 className="font-semibold mb-1">Folder Object:</h5>
          <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded-md text-xs overflow-x-auto">
            {`{
  "id": "string",
  "name": "string",
  "parentId": "string | null",
  "isDeletable": "boolean",
  "isRenamable": "boolean"
}`}
          </pre>
        </div>
      </section>
      
      <section>
        <h4 className="text-lg font-semibold mb-1">Data Portability (Import/Export)</h4>
        <p>The application now includes robust JSON import and export features:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Export:</strong> Creates a comprehensive JSON backup of all your prompts and folders. Save this file in a safe place.</li>
            <li><strong>Import:</strong> Allows you to restore your data from a previously exported JSON file.
                <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
                    <li><strong className="text-red-600 dark:text-red-400">IMPORTANT:</strong> As stated in the user guide, importing will replace all existing data. Always back up your current data via export before importing if you have changes you don't want to lose.</li>
                    <li>The import process validates the basic structure of the file (presence of <code>prompts</code> and <code>folders</code> arrays). However, manually editing the JSON file can lead to import errors if the structure or data types are corrupted.</li>
                </ul>
            </li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold mb-1">🤖 AI Text Generation with Ollama (Advanced)</h4>
        <p>The Ollama integration uses the <code>/api/generate</code> endpoint.</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Environment Variables:</strong> <code>OLLAMA_API_ENDPOINT</code> (or <code>VITE_OLLAMA_API_ENDPOINT</code>) and <code>OLLAMA_MODEL_NAME</code> (or <code>VITE_OLLAMA_MODEL_NAME</code>) are read from <code>process.env</code> or <code>import.meta.env</code>. Ensure your build process makes these available to your client-side JavaScript.</li>
          <li><strong>Request:</strong> A <code>POST</code> request is made with a JSON body: <code>{'{"model": "your_model_name", "prompt": "your_prompt_text", "stream": false}'}</code>.</li>
          <li><strong>Response:</strong> The application expects a JSON response. The generated text is taken from the <code>response</code> field of this JSON.</li>
          <li><strong>Error Handling:</strong>
            <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
              <li>Checks for missing environment variables.</li>
              <li>Handles network errors if the Ollama endpoint is unreachable.</li>
              <li>Parses errors from Ollama's JSON response if the HTTP request was successful but Ollama signals an error (e.g., model not found).</li>
              <li>Alerts the user with specific error messages for common issues.</li>
            </ul>
          </li>
        </ul>
      </section>
    </div>
  );

  return (
    <div>
      <div className="border-b border-neutral-200 dark:border-neutral-700 mb-4">
        <nav className="flex space-x-4 -mb-px">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-sm font-medium border-b-2
                        ${activeTab === 'guide' 
                          ? 'border-primary text-primary-dark dark:text-primary-light dark:border-primary-light' 
                          : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600'}`}
          >
            User Guide
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`py-3 px-4 text-sm font-medium border-b-2
                        ${activeTab === 'advanced' 
                          ? 'border-primary text-primary-dark dark:text-primary-light dark:border-primary-light' 
                          : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600'}`}
          >
            Advanced Info / Data
          </button>
        </nav>
      </div>
      {activeTab === 'guide' ? renderUserGuide() : renderAdvancedInfo()}
    </div>
  );
};


const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Help & Information">
      <HelpModalContent />
    </Modal>
  );
};

export default HelpModal;