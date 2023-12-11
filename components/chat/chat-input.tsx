"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem } from '../ui/form'
import { Plus, Smile } from 'lucide-react'
import qs from 'query-string'
import axios from 'axios'

interface Props {
    apiUrl: string
    query: Record<string, any>
    name: string
    type: 'conversation' | 'channel' | 'server'
}
const formSchema = z.object({
    content: z.string().min(1)
})

export default function ChatInput({ apiUrl, query, name, type }: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: ''
        }
    })
    const isLoading = form.formState.isSubmitting

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values, 'values')
        try {
            const url = qs.stringifyUrl({
                url: apiUrl,
                query,
            })
            await axios.post(url, values)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField control={form.control} name='content' render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <div className='relative p-4 pb-6'>
                                <button onClick={() => { }} className='bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center absolute top-7 left-8 h-[24px] w-[24px]' type='button'>
                                    <Plus className='h-5 w-5 text-white dark:text-black' />
                                </button>
                                <Input {...field} placeholder={`Message ${type === 'conversation' ? name : '#' + name}`} disabled={isLoading} className='px-14 py-6 bg-slate-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200' />
                                <div className="absolute top-7 right-8">
                                    <Smile />
                                </div>
                            </div>
                        </FormControl>
                    </FormItem>
                )} />
            </form>
        </Form>
    )
}
