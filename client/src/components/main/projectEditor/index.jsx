import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import Editor from '@monaco-editor/react';
import './index.css';
import { useParams } from 'react-router-dom';

const ProjectEditor = () => {
  const { projectId } = useParams();

  return (
    <div className='editor-container'>
      <aside className='file-tree'>
        <div className='file-tree-header'>Files</div>
        <ul className='file-list'>
          <li className='file-item active'>main.py</li>
          <li className='file-item'>utils.py</li>
        </ul>
      </aside>
      <main className='code-editor'>
        <div className='editor-header'>
          <span className='file-name'>main.py</span>
          <div className='editor-actions'>
            <button className='btn'>Search</button>
            <button className='btn'>Share</button>
          </div>
        </div>
        <Editor
          height='calc(100vh - 3rem)'
          defaultLanguage='python'
          defaultValue={'# Start coding here...'}
          theme='vs-dark'
        />
      </main>
    </div>
  );
};

export default ProjectEditor;
