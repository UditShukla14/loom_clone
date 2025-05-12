import React from 'react'

const FormField = ({id,label,value,onChange,placeholder,as='input',options=[]}:FormFieldProps) => {
       
  return (
    <div className='form-field'>
        <label htmlFor={id}>{label}</label>
        {as === 'textarea' ?
            (
<textarea
            id={id}
            value={value}
            name={id}
            onChange={onChange}
            placeholder={placeholder}
            />
            ) : as === 'select' ?
            (
                <select
                id={id}
                value={value}
                name={id}
                onChange={onChange}
            >
                {options.map(({label,value})=>(
                    <option key={label} value={value}>{label}</option>
                ))}
            </select>
            ) : (
                <input
            id={id}
            value={value}
            name={id}
            onChange={onChange}
            placeholder={placeholder}
            />
            )
        }
    </div>
  )
}

export default FormField