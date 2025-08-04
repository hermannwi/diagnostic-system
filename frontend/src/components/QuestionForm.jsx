import React, { useState } from 'react';

export default function QuestionForm(props) {
    const [question, setQuestion] = useState('')
    const [editQuestion, setEditQuestion] = useState('')
    const [description, setDescription] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [helpTextLink, setHelpTextLink] = useState('')
    const [editHelpTextLink, setEditHelpTextLink] = useState('')
    const [helpImageLink, setHelpImageLink] = useState('')
    const [editHelpImageLink, setEditHelpImageLink] = useState('')
    const [editingID, setEditingID] = useState(null)

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            const response = await fetch('http://localhost:5001/admin/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({question: question, description: description, help_text_link: helpTextLink, help_image_link: helpImageLink})
        })

        if (response.ok) {
            setQuestion('')
            setDescription('')
            setEditHelpTextLink('')
            setEditHelpImageLink('')
            props.fetchQuestions()  
        }
        } catch (error) {
            console.error('Error adding question:', error)
        }
        
    }
    
    return (
        <section>
            <h1>Question Form</h1>
            <form onSubmit={handleSubmit} method='post'>
                <div className='question-inputs'>
                    <label htmlFor="question">Question: </label>
                    <input type="text" id='question' name='question' value={question} onChange={(e) => setQuestion(e.target.value)}/>
                    <label htmlFor="description">Description: </label>
                    <input type="text" id='description' name='description' value={description} onChange={(e) => setDescription(e.target.value)}/>
                    <label htmlFor="help_text_link">Help Text Link: </label>
                    <input type="text" id='help_text_link' name='help_text_link' value={helpTextLink} onChange={(e) => setHelpTextLink(e.target.value)}/>
                    <label htmlFor="help_image_link">Help Image Link: </label>
                    <input type="text" id='help_image_link' name='help_image_link' value={helpImageLink} onChange={(e) => setHelpImageLink(e.target.value)}/>
                </div>
                
                <button>ADD</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Question</th>
                        <th>Description</th>
                        <th>Help Text Link</th>
                        <th>Help Image Link</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                    </tr>
                </thead>
                <tbody>
                    {props.allQuestions.map(question => (
                        <tr key={question.id}>
                            <td>{question.id}</td>
                            <td>{question.question}</td>
                            <td>{question.description}</td>
                            <td>{question.help_text_link}</td>
                            <td>{question.help_image_link}</td>
                            <td>{question.created_at}</td>
                            <td>{question.updated_at}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    )
}